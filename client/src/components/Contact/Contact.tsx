import { useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import "./Contact.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

function Contact() {
  const { settings } = useCatalog();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error("Failed");

      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Could not send message. Please try again shortly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-content">
        <h2>Get In Touch</h2>
        <p className="contact-subtitle">
          Questions, catering requests, or feedback — we&apos;d love to hear from
          you.
        </p>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-info-item">
              <strong>Phone</strong>
              <span>{settings.phone}</span>
            </div>
            <div className="contact-info-item">
              <strong>Email</strong>
              <span>{settings.email}</span>
            </div>
            <div className="contact-info-item">
              <strong>Location</strong>
              <span>{settings.location}</span>
            </div>
            <div className="contact-info-item">
              <strong>Hours</strong>
              <span>{settings.hours}</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {submitted && (
              <p className="contact-success">
                Thanks! Your message was sent to the kitchen team.
              </p>
            )}
            {error && <p className="contact-error">{error}</p>}

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
