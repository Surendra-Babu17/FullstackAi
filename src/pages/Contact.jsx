import React, { useState } from "react";
import { useToast } from "../components/ToastProvider";
import './Home.css'
export default function Contact(){
  const toast = useToast();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");

  const submit = (e)=>{
    e.preventDefault();
    if(!name||!email||!message) return toast("Fill all fields","error");
    // you can POST to your contact api endpoint if you have one
    toast("Message sent — we'll contact you", "success");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 card">
      <h2 className="text-2xl font-semibold mb-4">Contact</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="p-3 rounded bg-white/5" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="p-3 rounded bg-white/5" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea className="p-3 rounded bg-white/5" rows={6} placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} />
        <button className="btn btn-accent mt-2" type="submit">Send message</button>
      </form>
    </div>
  );
}
