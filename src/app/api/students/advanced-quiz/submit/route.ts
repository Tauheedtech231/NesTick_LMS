import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slideId, courseId, enrollmentId, studentEmail, answers } = body;

    console.log('📌 ========== QUIZ SUBMISSION ==========');
    console.log('📌 Slide ID:', slideId);
    console.log('📌 Course ID:', courseId);
    console.log('📌 Enrollment ID:', enrollmentId);
    console.log('📌 Student Email:', studentEmail);
    console.log('📌 Raw Answers Received:', JSON.stringify(answers, null, 2));

    if (!slideId || !enrollmentId || !studentEmail || !answers) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Get questions with correct answers
    const questions = await query<any[]>(
      `SELECT id, question_type, question_text, correct_answer, points
       FROM tf_fill_questions 
       WHERE slide_id = ?`,
      [slideId]
    );

    console.log('📌 Questions Count:', questions?.length || 0);
    console.log('📌 Questions Details:', JSON.stringify(questions, null, 2));

    if (!questions || questions.length === 0) {
      return NextResponse.json({ success: false, error: 'No questions found' }, { status: 404 });
    }

    // Ensure course_quizzes entry exists
    let quizRecord = await query<any[]>(
      `SELECT id FROM course_quizzes WHERE slide_id = ?`,
      [slideId]
    );

    let quizId: string;

    if (!quizRecord || quizRecord.length === 0) {
      quizId = uuidv4();
      await query(
        `INSERT INTO course_quizzes (id, slide_id, course_id, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [quizId, slideId, courseId]
      );
      console.log('📌 Created new quiz record:', quizId);
    } else {
      quizId = quizRecord[0].id;
      console.log('📌 Using existing quiz record:', quizId);
    }

    // Calculate score and log user answers
    let totalScore = 0;
    let totalPoints = 0;
    const answerResults: any[] = [];

    console.log('\n📌 ========== ANSWER EVALUATION ==========');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const points = q.points || 1;
      totalPoints += points;
      
      let correctAnswer;
      try {
        correctAnswer = JSON.parse(q.correct_answer);
      } catch (e) {
        correctAnswer = q.correct_answer;
      }
      
      const studentAnswer = answers[q.id];
      
      console.log(`\n📌 Question ${i + 1}:`);
      console.log(`   ID: ${q.id}`);
      console.log(`   Type: ${q.question_type}`);
      console.log(`   Question Text: ${q.question_text}`);
      console.log(`   Correct Answer: ${JSON.stringify(correctAnswer)}`);
      console.log(`   Student Answer: ${JSON.stringify(studentAnswer)}`);
      console.log(`   Points: ${points}`);
      
      let isCorrect = false;
      let userAnswerDisplay = '';
      
      if (q.question_type === 'true_false') {
        userAnswerDisplay = studentAnswer === 0 ? 'True' : (studentAnswer === 1 ? 'False' : 'Not answered');
        const correctAnswerValue = correctAnswer === 0 ? 'True' : 'False';
        isCorrect = studentAnswer !== null && studentAnswer !== undefined && 
                    userAnswerDisplay.toLowerCase() === correctAnswerValue.toLowerCase();
        console.log(`   User Answer Display: ${userAnswerDisplay}`);
        console.log(`   Correct Answer Display: ${correctAnswerValue}`);
      } else if (q.question_type === 'fill_blanks') {
        userAnswerDisplay = Array.isArray(studentAnswer) 
          ? studentAnswer.map(a => a || '(empty)').join(', ') 
          : (studentAnswer || 'Not answered');
        
        console.log(`   User Answer Display: ${userAnswerDisplay}`);
        console.log(`   Correct Answer Display: ${JSON.stringify(correctAnswer)}`);
        
        if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer) && 
            studentAnswer.length === correctAnswer.length) {
          isCorrect = studentAnswer.every((ans, idx) => 
            ans?.trim().toLowerCase() === correctAnswer[idx]?.toString().toLowerCase()
          );
        } else if (!Array.isArray(correctAnswer) && studentAnswer) {
          isCorrect = studentAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();
        }
      }
      
      console.log(`   Is Correct: ${isCorrect ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   Points Earned: ${isCorrect ? points : 0}`);
      
      if (isCorrect) {
        totalScore += points;
      }
      
      answerResults.push({
        questionId: q.id,
        question: q.question_text,
        type: q.question_type,
        userAnswer: userAnswerDisplay,
        correctAnswer: q.question_type === 'true_false' 
          ? (correctAnswer === 0 ? 'True' : 'False')
          : (Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer),
        isCorrect,
        pointsEarned: isCorrect ? points : 0,
        totalPoints: points
      });
    }

    const percentage = (totalScore / totalPoints) * 100;
    const passed = percentage >= 70;

    console.log('\n📌 ========== FINAL SCORE ==========');
    console.log(`📌 Total Score: ${totalScore} / ${totalPoints}`);
    console.log(`📌 Percentage: ${Math.round(percentage)}%`);
    console.log(`📌 Passed: ${passed ? 'YES ✅' : 'NO ❌'}`);

    // Check if already attempted
    const existingAttempt = await query<any[]>(
      `SELECT id FROM quiz_attempts_new 
       WHERE quiz_id = ? AND student_email = ?`,
      [quizId, studentEmail]
    );

    if (existingAttempt && existingAttempt.length > 0) {
      console.log('📌 Updating existing attempt...');
      await query(
        `UPDATE quiz_attempts_new 
         SET answers = ?, score = ?, total_possible = ?, percentage = ?, 
             passed = ?, status = 'completed', completed_at = NOW()
         WHERE quiz_id = ? AND student_email = ?`,
        [
          JSON.stringify(answerResults),
          totalScore,
          totalPoints,
          percentage,
          passed ? 1 : 0,
          quizId,
          studentEmail
        ]
      );
    } else {
      const attemptId = uuidv4();
      await query(
        `INSERT INTO quiz_attempts_new 
         (id, quiz_id, student_email, enrollment_id, answers, score, total_possible, 
          percentage, passed, status, completed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW(), NOW())`,
        [
          attemptId,
          quizId,
          studentEmail,
          enrollmentId,
          JSON.stringify(answerResults),
          totalScore,
          totalPoints,
          percentage,
          passed ? 1 : 0
        ]
      );
      console.log('📌 Inserted new attempt ID:', attemptId);
    }

    // Verify data was saved
    const verify = await query<any[]>(
      `SELECT id, score, total_possible FROM quiz_attempts_new 
       WHERE quiz_id = ? AND student_email = ?`,
      [quizId, studentEmail]
    );
    
    console.log('\n📌 ========== VERIFICATION ==========');
    console.log(`📌 Data saved in database: ${verify && verify.length > 0 ? 'YES ✅' : 'NO ❌'}`);
    if (verify && verify.length > 0) {
      console.log(`📌 Saved Score: ${verify[0].score} / ${verify[0].total_possible}`);
    }
    
    console.log('\n📌 ========== SUBMISSION COMPLETE ==========\n');

    return NextResponse.json({
      success: true,
      data: {
        score: totalScore,
        total: totalPoints,
        percentage: Math.round(percentage),
        passed,
        answers: answerResults
      }
    });

  } catch (error: any) {
    console.error('❌ Error submitting advanced quiz:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to submit quiz' 
    }, { status: 500 });
  }
}