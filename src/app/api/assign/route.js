import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
  const { worker, instruction } = await req.json();

  try {
    console.log("🔥 API HIT");
    console.log("ENV USER:", process.env.EMAIL_USER ? "OK" : "MISSING");
    console.log("ENV PASS:", process.env.EMAIL_PASS ? "OK" : "MISSING");
    console.log("📧 Sending to:", worker);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 🔥 verify connection first
    await transporter.verify();
    console.log("✅ Transporter verified");

    await transporter.sendMail({
      from: `"SmartSphere City" <${process.env.EMAIL_USER}>`,
      to: worker,
      subject: "🚧 New Task Assigned - SmartSphere City",
    
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: #2563eb; color: white; padding: 15px 20px; font-size: 20px; font-weight: bold;">
            🚧 SmartSphere City
          </div>
    
          <!-- Body -->
          <div style="padding: 20px; color: #333;">
            <p>Hello 👋,</p>
    
            <p>You have been assigned a new task by the Smart City system.</p>
    
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <b>📌 Task Details:</b><br/>
              ${instruction}
            </div>
    
            <p>Please complete the task and update the system once finished.</p>
    
            <p style="margin-top: 20px;">Thank you for your contribution 🙌</p>
    
            <p style="font-weight: bold;">– SmartSphere City Team</p>
          </div>
    
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 10px 20px; font-size: 12px; color: #777; text-align: center;">
            This is an automated message. Please do not reply.
          </div>
    
        </div>
      </div>
      `
    });

    console.log("✅ Email sent");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}