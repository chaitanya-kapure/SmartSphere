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
      from: `"SmartSphere_City" <${process.env.EMAIL_USER}>`,
      to: worker,
      subject: "Task Assigned - SmartSphere_City",
      text: `Hello 👋\n\nTask:\n${instruction}\n\nThanks 🚀`
    });

    console.log("✅ Email sent");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}