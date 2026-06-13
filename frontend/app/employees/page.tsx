"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";

type Employee = {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  department: string;
  active: boolean;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(() => api<Employee[]>("/employees").then(setEmployees).catch((e) => setMessage(e.message)), []);

  useEffect(() => { load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    try {
      await api("/employees", { method: "POST", body: JSON.stringify(payload) });
      form.reset();
      setMessage("Employee added successfully.");
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add employee");
    }
  }

  return (
    <>
      <section className="page-heading">
        <div><p className="eyebrow">Directory</p><h1>Employees</h1><p className="muted">Create employee IDs used for QR check-in.</p></div>
      </section>
      {message && <p className="message">{message}</p>}
      <section className="grid employees-grid">
        <form className="card form" onSubmit={submit}>
          <h2>Add employee</h2>
          <label>Employee code<input name="employee_code" placeholder="EMP003" required /></label>
          <label>Full name<input name="name" placeholder="Ananya Singh" required /></label>
          <label>Email<input name="email" type="email" placeholder="ananya@company.com" required /></label>
          <label>Department<input name="department" placeholder="Engineering" required /></label>
          <button className="primary" type="submit">Create employee</button>
        </form>
        <article className="card">
          <div className="card-title"><h2>Team directory</h2><span className="pill">{employees.length} employees</span></div>
          <div className="attendance-list">
            {employees.map((employee) => (
              <div className="attendance-row" key={employee.id}>
                <span className="avatar">{employee.name.charAt(0)}</span>
                <div><strong>{employee.name}</strong><small>{employee.employee_code} · {employee.department}<br />{employee.email}</small></div>
                <span className={employee.active ? "status" : "status inactive"}>{employee.active ? "Active" : "Inactive"}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
