import { useState } from 'react';

export default function PostForm({ onAddPost }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please fill in both Title and Body!');
      return;
    }

    setSubmitting(true);
    await onAddPost({ title, body });
    setTitle('');
    setBody('');
    setSubmitting(false);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>New post</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          style={styles.textarea}
        />
        <button type="submit" disabled={submitting} style={styles.addBtn}>
          {submitting ? 'Adding...' : 'Add post'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    color: 'var(--text-main)',
    fontSize: '18px',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: 'var(--text-main)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
  },
  addBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 24px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
  },
};