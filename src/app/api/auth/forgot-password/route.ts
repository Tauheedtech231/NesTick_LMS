/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, issue, userEmail } = body;
  
    if (!name || !issue) {
      return NextResponse.json(
        { success: false, error: 'Name and issue are required' },
        { status: 400 }
      );
    }

    const adminEmail = 'tauheeddeveloper13@gmail.com';
    const currentDateTime = new Date().toLocaleString('en-PK', {
      timeZone: 'Asia/Karachi',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // Email content
    const emailSubject = `🔐 Password Reset Request from ${name}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #0B1C3D 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            border-left: 4px solid #B11217;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .label {
            font-weight: bold;
            color: #1E3A8A;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .value {
            font-size: 16px;
            margin-bottom: 15px;
            padding: 8px;
            background: #f0f2f5;
            border-radius: 6px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6c757d;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background: #B11217;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🔐 Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>A user has requested password reset assistance. Please find the details below:</p>
          
          <div class="info-box">
            <div class="label">👤 User Name:</div>
            <div class="value">${name}</div>
            
            ${userEmail ? `<div class="label">📧 User Email:</div>
            <div class="value">${userEmail}</div>` : ''}
            
            <div class="label">❓ Issue Description:</div>
            <div class="value">${issue}</div>
            
            <div class="label">📅 Request Time:</div>
            <div class="value">${currentDateTime}</div>
          </div>
          
          <p>Please take appropriate action:</p>
          <ul>
            <li>Verify the user's identity</li>
            <li>Reset their password if needed</li>
            <li>Send new credentials to their registered email</li>
          </ul>
          
          <div style="text-align: center;">
            <div class="button">Action Required</div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from your LMS system.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      PASSWORD RESET REQUEST
      ---------------------
      
      User Name: ${name}
      ${userEmail ? `User Email: ${userEmail}` : ''}
      Issue: ${issue}
      Request Time: ${currentDateTime}
      
      Please take appropriate action to help this user.
    `;

    // ✅ Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ Verify connection
    await transporter.verify();
    console.log('✅ Email transporter ready');

    // ✅ Send email
    const info = await transporter.sendMail({
      from: `"LMS Support" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    });

    console.log('✅ Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Your request has been sent to admin. You will receive a response shortly.'
    });

  } catch (error: any) {
    console.error('❌ Error in forgot password API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send request. Please try again later.'
      },
      { status: 500 }
    );
  }
}