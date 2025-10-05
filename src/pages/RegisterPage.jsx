import React, { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Enviado:\nNome: ${form.name}\nEmail: ${form.email}`);
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 16 }}>Criar conta</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Nome
          <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          Senha
          <input name="password" type="password" value={form.password} onChange={handleChange} style={{ width: "100%", padding: 8, marginTop: 4 }} required />
        </label>

        <button type="submit" style={{ padding: "10px 14px", cursor: "pointer" }}>
          Registrar
        </button>
      </form>
    </main>
  );
}

