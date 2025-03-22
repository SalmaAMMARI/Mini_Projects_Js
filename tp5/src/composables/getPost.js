export async function getPost(id) {
  try {
    // Envoyer une requête GET à l'API pour récupérer le post par son ID
    const response = await fetch(`http://localhost:3001/posts/${id}`);

    // Vérifier si la réponse est valide
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Convertir la réponse en JSON
    const data = await response.json();

    // Retourner les données du post
    return data;
  } catch (err) {
    console.error('Erreur lors de la récupération du post:', err);
    throw err; // Propager l'erreur pour la gérer dans le composant
  }
}