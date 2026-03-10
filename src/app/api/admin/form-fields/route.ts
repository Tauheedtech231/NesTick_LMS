// app/api/admin/form-fields/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
// Safe JSON parse function
function safeJsonParse(value: any, defaultValue: any = null) {
  if (!value) return defaultValue;
  
  // If it's already an object/array, return it
  if (typeof value === 'object') return value;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Trim the string first
    value = value.trim();
    
    // If it's empty, return default
    if (value === '') return defaultValue;
    
    try {
      // Check if it's already a JSON string
      if (value.startsWith('[') || value.startsWith('{')) {
        return JSON.parse(value);
      }
      // If it's a comma-separated string, convert to array
      if (value.includes(',')) {
        return value.split(',').map((s: string) => s.trim());
      }
      // Single value
      return [value];
    } catch (e) {
      console.warn('⚠️ Failed to parse JSON, returning as string array:', value);
      return [value];
    }
  }
  
  return defaultValue;
}

// GET all form fields
export async function GET(request: NextRequest) {
  let connection;
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    connection = await getConnection();

    let query = `SELECT * FROM student_form_fields WHERE 1=1`;
    const params: any[] = [];

    if (id) {
      query += ` AND id = ?`;
      params.push(id);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY \`order\` ASC`;

    console.log('📊 Executing query:', query, params);

    const [rows] = await connection.execute(query, params);

    // Parse options JSON for each field
    const fields = (rows as any[]).map(row => {
      let parsedOptions = null;
      if (row.options) {
        try {
          parsedOptions = JSON.parse(row.options);
        } catch (e) {
          console.warn(`⚠️ Failed to parse options for field ${row.id}:`, e);
          parsedOptions = [row.options]; // Fallback to array with raw value
        }
      }
      
      return {
        id: row.id,
        label: row.label,
        name: row.name,
        type: row.type,
        placeholder: row.placeholder || '',
        required: row.required === 1,
        order: row.order,
        options: parsedOptions,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });

    return NextResponse.json({
      success: true,
      data: fields,
      count: fields.length
    });

  } catch (error: any) {
    console.error('Error fetching form fields:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// CREATE new form field
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const {
      label,
      name,
      type,
      placeholder,
      required,
      order,
      options,
      status
    } = body;

    console.log('📝 Creating new form field:', { 
      label, 
      name, 
      type, 
      options: options || 'none',
      optionsType: options ? typeof options : 'undefined',
      isArray: Array.isArray(options)
    });

    // Validation
    if (!label || !label.trim()) {
      return NextResponse.json(
        { success: false, error: 'Label is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Field name is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Field type is required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['text', 'email', 'number', 'file', 'textarea', 'select', 'radio', 'checkbox', 'date'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid field type' },
        { status: 400 }
      );
    }

    // Validate options for select/radio/checkbox
    if (['select', 'radio', 'checkbox'].includes(type)) {
      if (!options) {
        return NextResponse.json(
          { success: false, error: 'Options are required for select, radio, and checkbox fields' },
          { status: 400 }
        );
      }

      // Ensure options is an array
      let optionsArray: string[] = [];
      
      if (Array.isArray(options)) {
        optionsArray = options.filter(opt => opt && opt.trim() !== '');
      } else if (typeof options === 'string') {
        // Handle string input (from form)
        optionsArray = options
          .split('\n')
          .map(opt => opt.trim())
          .filter(opt => opt !== '');
      }

      if (optionsArray.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one option is required' },
          { status: 400 }
        );
      }
      
      // Replace options with cleaned array
      body.options = optionsArray;
    }

    connection = await getConnection();

    // Check if name already exists
    const [existing] = await connection.execute(
      `SELECT id FROM student_form_fields WHERE name = ?`,
      [name.trim()]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Field with this name already exists' },
        { status: 400 }
      );
    }

    const fieldId = uuidv4();

    // Prepare options for storage - convert to JSON string
    let optionsJson = null;
    if (body.options && Array.isArray(body.options) && body.options.length > 0) {
      optionsJson = JSON.stringify(body.options);
      console.log('📦 Storing options as JSON:', optionsJson);
    }

    const insertParams = [
      fieldId,
      label.trim(),
      name.trim(),
      type,
      placeholder?.trim() || null,
      required ? 1 : 0,
      order || 1,
      optionsJson,
      status || 'active'
    ];

    console.log('📦 Inserting field with params:', insertParams);

    await connection.execute(
      `INSERT INTO student_form_fields (
        id, label, name, type, placeholder, required, \`order\`, options, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      insertParams
    );

    // Fetch the created field
    const [newField] = await connection.execute(
      `SELECT * FROM student_form_fields WHERE id = ?`,
      [fieldId]
    );

    const field = (newField as any[])[0];
    
    // Parse options for response
    let responseOptions = null;
    if (field.options) {
      try {
        responseOptions = JSON.parse(field.options);
      } catch (e) {
        responseOptions = [field.options];
      }
    }

    const responseField = {
      id: field.id,
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required === 1,
      order: field.order,
      options: responseOptions,
      status: field.status
    };

    return NextResponse.json({
      success: true,
      data: responseField,
      message: 'Form field created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating form field:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'A field with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create form field' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// UPDATE form field
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Field ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      label,
      name,
      type,
      placeholder,
      required,
      order,
      options,
      status
    } = body;

    console.log('📝 Updating form field:', { id, label, name, type });

    connection = await getConnection();

    // Check if field exists
    const [existing] = await connection.execute(
      `SELECT id FROM student_form_fields WHERE id = ?`,
      [id]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Field not found' },
        { status: 404 }
      );
    }

    // Check if name is already taken by another field
    if (name && name.trim()) {
      const [nameCheck] = await connection.execute(
        `SELECT id FROM student_form_fields WHERE name = ? AND id != ?`,
        [name.trim(), id]
      );

      if ((nameCheck as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: 'Another field with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (label !== undefined && label.trim()) {
      updates.push('label = ?');
      values.push(label.trim());
    }

    if (name !== undefined && name.trim()) {
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (type !== undefined) {
      const validTypes = ['text', 'email', 'number', 'file', 'textarea', 'select', 'radio', 'checkbox', 'date'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid field type' },
          { status: 400 }
        );
      }
      updates.push('type = ?');
      values.push(type);
    }

    if (placeholder !== undefined) {
      updates.push('placeholder = ?');
      values.push(placeholder?.trim() || null);
    }

    if (required !== undefined) {
      updates.push('required = ?');
      values.push(required ? 1 : 0);
    }

    if (order !== undefined) {
      updates.push('`order` = ?');
      values.push(order);
    }

    if (options !== undefined) {
      // Process options
      let optionsArray: string[] | null = null;
      
      if (Array.isArray(options) && options.length > 0) {
        optionsArray = options.filter(opt => opt && opt.trim() !== '');
      } else if (typeof options === 'string' && options.trim()) {
        optionsArray = options.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
      }
      
      // Convert to JSON string for storage
      const optionsJson = optionsArray && optionsArray.length > 0 
        ? JSON.stringify(optionsArray) 
        : null;
      
      updates.push('options = ?');
      values.push(optionsJson);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    console.log('📦 Updating with:', updates, values);

    await connection.execute(
      `UPDATE student_form_fields SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated field
    const [updated] = await connection.execute(
      `SELECT * FROM student_form_fields WHERE id = ?`,
      [id]
    );

    const field = (updated as any[])[0];
    
    // Parse options for response
    let responseOptions = null;
    if (field.options) {
      try {
        responseOptions = JSON.parse(field.options);
      } catch (e) {
        responseOptions = [field.options];
      }
    }

    const responseField = {
      id: field.id,
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required === 1,
      order: field.order,
      options: responseOptions,
      status: field.status
    };

    return NextResponse.json({
      success: true,
      data: responseField,
      message: 'Form field updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating form field:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// DELETE form field
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Field ID required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if field exists
    const [existing] = await connection.execute(
      `SELECT id FROM student_form_fields WHERE id = ?`,
      [id]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Field not found' },
        { status: 404 }
      );
    }

    await connection.execute(
      `DELETE FROM student_form_fields WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Form field deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting form field:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}