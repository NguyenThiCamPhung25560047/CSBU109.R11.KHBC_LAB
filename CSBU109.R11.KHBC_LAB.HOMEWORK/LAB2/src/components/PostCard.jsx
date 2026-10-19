export default function PostCard({ post, onView, onDelete }) {
  const likes = typeof post.reactions === 'object' ? post.reactions.likes : post.reactions || 0;
  const dislikes = typeof post.reactions === 'object' ? post.reactions.dislikes : 0;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{post.title}</h3>

      {post.tags && post.tags.length > 0 && (
        <div style={styles.tagContainer}>
          {post.tags.map((tag, idx) => (
            <span key={idx} style={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={styles.reactions}>
        👍 {likes} · 👎 {dislikes}
      </div>

      <div style={styles.actions}>
        <button onClick={() => onView(post.id)} style={styles.viewBtn}>
          View
        </button>
        <button onClick={() => onDelete(post.id)} style={styles.deleteBtn}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  title: {
    margin: '0 0 12px 0',
    color: 'var(--text-main)',
    fontSize: '18px',
    fontWeight: '700',
  },
  tagContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'var(--tag-bg)',
    color: 'var(--tag-text)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  reactions: {
    fontSize: '14px',
    color: 'var(--text-sub)',
    marginBottom: '16px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  viewBtn: {
    backgroundColor: '#312e81',
    color: '#a5b4fc',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 20px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 20px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
  },
};