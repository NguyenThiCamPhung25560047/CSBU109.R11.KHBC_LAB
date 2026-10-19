import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { getPosts, searchPosts, getPostComments, createPost, deletePost } from '../services/postApi';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let data;
        if (debouncedSearch.trim() !== '') {
          data = await searchPosts(debouncedSearch, controller.signal);
        } else {
          const skip = (page - 1) * LIMIT;
          data = await getPosts(LIMIT, skip, controller.signal);
        }
        setPosts(data.posts);
        setTotal(data.total);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [debouncedSearch, page]);

  const handleAddPost = async (newPostData) => {
    try {
      const created = await createPost(newPostData);
      setPosts((prev) => [created, ...prev]);
    } catch (err) {
      alert('Failed to add post');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleViewPost = async (id) => {
    const postObj = posts.find((p) => p.id === id);
    setSelectedPost(postObj);
    setLoadingComments(true);
    try {
      const data = await getPostComments(id);
      setComments(data.comments);
    } catch (err) {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Mini Blog Manager</h1>

      <PostForm onAddPost={handleAddPost} />

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 2 }}>
          {loading && <h3>Loading posts...</h3>}
          {error && <h3 style={{ color: '#ef4444' }}>Error: {error}</h3>}

          {!loading && !error && (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onView={handleViewPost}
                  onDelete={handleDeletePost}
                />
              ))}

              {debouncedSearch.trim() === '' && (
                <div style={styles.pagination}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    style={styles.pageBtn}
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: '600' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={styles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {selectedPost && (
          <div style={styles.detailSidebar}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Post Detail</h2>
              <button onClick={() => setSelectedPost(null)} style={styles.closeBtn}>
                Close
              </button>
            </div>

            <h3 style={{ marginTop: '16px', color: '#818cf8' }}>{selectedPost.title}</h3>
            <p style={{ color: 'var(--text-sub)', lineHeight: '1.6' }}>{selectedPost.body}</p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)', margin: '20px 0' }} />

            <h4>Comments</h4>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p style={{ color: 'var(--text-sub)' }}>No comments yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map((c) => (
                  <div key={c.id} style={styles.commentItem}>
                    <strong style={{ color: '#a5b4fc' }}>@{c.user.username}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '36px',
    color: '#818cf8',
    fontWeight: '800',
    marginBottom: '28px',
  },
  searchInput: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  pagination: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginTop: '24px',
  },
  pageBtn: {
    padding: '8px 18px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: '600',
  },
  detailSidebar: {
    flex: 1,
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
    padding: '24px',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  },
  closeBtn: {
    padding: '4px 12px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'transparent',
    color: 'var(--text-sub)',
    cursor: 'pointer',
  },
  commentItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid var(--card-border)',
    padding: '12px',
    borderRadius: '10px',
  },
};