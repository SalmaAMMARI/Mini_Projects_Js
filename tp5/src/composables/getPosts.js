export async function getPosts() {
  try {
    const response = await fetch('http://localhost:3001/posts'); // URL de l'API
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Erreur lors de la récupération des offres:', err);
    throw err;
  }
}