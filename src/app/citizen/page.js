'use client';
import { useState } from 'react';
import { db } from "../../lib/firebase";import { collection, addDoc } from "firebase/firestore";

export default function Citizen(){
  const [area,setArea]=useState("");
  const [desc,setDesc]=useState("");
  const [image,setImage]=useState("");

  const handleImage=e=>{
    const reader=new FileReader();
    reader.onload=()=>setImage(reader.result);
    reader.readAsDataURL(e.target.files[0]);
  };
  const submit = async () => {
    if (!area || !desc) {
      alert("Fill all fields");
      return;
    }
  
    await addDoc(collection(db, "complaints"), {
      area,
      description: desc,
      image,
      status: "pending",
      createdAt: new Date()
    });
  
    alert("Complaint Submitted 🚀");
  
    // 🔥 reset form
    setArea("");
    setDesc("");
    setImage("");
  };

  return (
    <div className="home-wrapper">
  
      <h2 className="title">Citizen Portal 👤</h2>
      <p className="subtitle">Report city issues easily</p>
  
      <div className="card form-card">
  
        <input
          className="input"
          placeholder="📍 Enter Area"
          onChange={e => setArea(e.target.value)}
        />
  
        <textarea
          className="input textarea"
          placeholder="📝 Describe the issue..."
          onChange={e => setDesc(e.target.value)}
        />
  
        {/* 🔥 Styled file input */}
        <label className="file-label">
          📸 Upload Image
          <input type="file" onChange={handleImage} hidden />
        </label>
  
        {/* 🔥 Image preview */}
        {image && (
          <img src={image} className="preview-img" />
        )}
  
        <button className="btn submit-btn" onClick={submit}>
          Submit Complaint 🚀
        </button>
  
      </div>
    </div>
  );
}
