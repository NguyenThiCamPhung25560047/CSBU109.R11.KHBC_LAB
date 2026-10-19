const BASE_URL = 'https://dummyjson.com';

export async function getPosts(limit = 10, skip = 0, signal) {
  const res = await fetch(`${BASE_URL}/posts?limit=${limit}&skip=${skip}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function searchPosts(query, signal) {
  const res = await fetch(`${BASE_URL}/posts/search?q=${encodeURIComponent(query)}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getPostComments(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}/comments`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createPost(postData) {
  const res = await fetch(`${BASE_URL}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: postData.title,
      body: postData.body,
      userId: 1,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}