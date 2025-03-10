<template>
  <div>
    <!-- En-tête -->
    <header>
      <div class="logo-container">
        <img src="logo.jpg" alt="LOGO" />
        <h1>Les Bonnes Pièces</h1>
      </div>
    </header>

    <!-- Section principale -->
    <main>
      <!-- Menu de recherche (Filtre) -->
      <aside class="filtres">
        <h3>Filtres</h3>
        <div class="input-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="🔍 Recherchez un produit..." 
          />
        </div>

        <!-- Filtrage par catégorie -->
        <div class="filter-section">
          <h4>Filtrer par catégorie</h4>
          <select v-model="filterByCategory">
            <option value="all">Toutes catégories</option>
            <option v-for="categorie in categories" :key="categorie" :value="categorie">
              {{ categorie }}
            </option>
          </select>
        </div>

        <!-- Filtrage par disponibilité -->
        <div class="filter-section">
          <h4>Filtrer par disponibilité</h4>
          <select v-model="filterByAvailability">
            <option value="all">Tous</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">Indisponibles</option>
          </select>
        </div>

        <!-- Tri par prix -->
        <div class="filter-section">
          <h4>Trier par prix</h4>
          <select v-model="sortOrder">
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </aside>

      <!-- Fiches produits -->
      <section class="fiches">
        <div v-for="produit in filteredProduits" :key="produit.id" class="produit">
          <img :src="produit.Image" :alt="produit.nom" />
          <h3>{{ produit.nom }}</h3>
          <p class="prix">Prix : {{ produit.prix }} Dhs</p>
          <p v-if="produit.Disponible" class="disponible">✅ Disponible</p>
          <p v-else class="indisponible">❌ Indisponible</p>
          <button @click="ajouterAuPanier(produit)" class="but">Ajouter au panier</button>
        </div>
      </section>

      <!-- Panier -->
      <section class="panier">
        <h3>Panier</h3>
        <div v-if="panier.length === 0">
          <p>Votre panier est vide.</p>
        </div>
        <div v-else>
          <div v-for="(item, index) in panier" :key="item.produit.id" class="panier-item">
            <h4>{{ item.produit.nom }}</h4>
            <p>Prix unitaire : {{ item.produit.prix }} Dhs</p>
            <p>Quantité : {{ item.quantite }}</p>
            <p>Total : {{ item.produit.prix * item.quantite }} Dhs</p>
            <button @click="supprimerDuPanier(index)">Supprimer</button>
          </div>
          <p class="prix-total">Prix total : {{ prixTotal }} Dhs</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      searchQuery: '',
      filterByCategory: 'all', // 'all' ou une catégorie spécifique
      filterByAvailability: 'all', // 'all', 'available', 'unavailable'
      sortOrder: 'asc', // 'asc' pour croissant, 'desc' pour décroissant
      panier: [], // Tableau pour stocker les produits ajoutés au panier
      produits: [
        {
          "id": 1,
          "nom": "Batterie 12V",
          "prix": 120,
          "categorie": "Électricité",
          "Image": "image_batterie_12v.jpg",
          "Disponible": true
        },
        {
          "id": 2,
          "nom": "Filtre à huile",
          "prix": 15,
          "categorie": "Filtration",
          "Image": "image_filtre_huile.jpg",
          "Disponible": true
        },
        {
          "id": 3,
          "nom": "Bougies d'allumage (x4)",
          "prix": 35,
          "categorie": "Moteur",
          "Image": "image_bougies_allumage.jpg",
          "Disponible": false
        },
        {
          "id": 4,
          "nom": "Disques de frein (x2)",
          "prix": 80,
          "categorie": "Freinage",
          "Image": "image_disques_frein.jpg",
          "Disponible": true
        },
        {
          "id": 5,
          "nom": "Courroie de distribution",
          "prix": 90,
          "categorie": "Moteur",
          "Image": "image_courroie_distribution.jpg",
          "Disponible": false
        },
        {
          "id": 6,
          "nom": "Pompe à eau",
          "prix": 70,
          "categorie": "Refroidissement",
          "Image": "image_pompe_eau.jpg",
          "Disponible": true
        },
        {
          "id": 7,
          "nom": "Amortisseurs arrière (x2)",
          "prix": 150,
          "categorie": "Suspension",
          "Image": "image_amortisseurs_arriere.jpg",
          "Disponible": true
        },
        {
          "id": 8,
          "nom": "Filtre à air",
          "prix": 20,
          "categorie": "Filtration",
          "Image": "image_filtre_air.jpg",
          "Disponible": true
        },
        {
          "id": 9,
          "nom": "Capteur ABS",
          "prix": 50,
          "categorie": "Sécurité",
          "Image": "image_capteur_abs.jpg",
          "Disponible": false
        },
        {
          "id": 10,
          "nom": "Radiateur de refroidissement",
          "prix": 130,
          "categorie": "Refroidissement",
          "Image": "image_radiateur_refroidissement.jpg",
          "Disponible": true
        },
        {
          "id": 11,
          "nom": "Alternateur",
          "prix": 200,
          "categorie": "Électricité",
          "Image": "image_alternateur.jpg",
          "Disponible": true
        },
        {
          "id": 12,
          "nom": "Démarreur",
          "prix": 180,
          "categorie": "Électricité",
          "Image": "image_demarreur.jpg",
          "Disponible": false
        },
        {
          "id": 13,
          "nom": "Kit d’embrayage",
          "prix": 220,
          "categorie": "Transmission",
          "Image": "image_kit_embrayage.jpg",
          "Disponible": true
        },
        {
          "id": 14,
          "nom": "Injecteur de carburant",
          "prix": 110,
          "categorie": "Moteur",
          "Image": "image_injecteur_carburant.jpg",
          "Disponible": true
        },
        {
          "id": 15,
          "nom": "Pompe à carburant",
          "prix": 90,
          "categorie": "Carburant",
          "Image": "image_pompe_carburant.jpg",
          "Disponible": true
        },
        {
          "id": 16,
          "nom": "Capteur de pression des pneus (TPMS)",
          "prix": 45,
          "categorie": "Sécurité",
          "Image": "image_capteur_tpms.jpg",
          "Disponible": true
        },
        {
          "id": 17,
          "nom": "Rétroviseur extérieur",
          "prix": 60,
          "categorie": "Carrosserie",
          "Image": "image_retroviseur_exterieur.jpg",
          "Disponible": false
        },
        {
          "id": 18,
          "nom": "Échappement complet",
          "prix": 250,
          "categorie": "Échappement",
          "Image": "image_echappement_complet.jpg",
          "Disponible": true
        },
        {
          "id": 19,
          "nom": "Vanne EGR",
          "prix": 140,
          "categorie": "Moteur",
          "Image": "image_vanne_egr.jpg",
          "Disponible": true
        },
        {
          "id": 20,
          "nom": "Turbo",
          "prix": 400,
          "categorie": "Moteur",
          "Image": "image_turbo.jpg",
          "Disponible": true
        },
        {
          "id": 21,
          "nom": "Joint de culasse",
          "prix": 75,
          "categorie": "Moteur",
          "Image": "image_joint_culasse.jpg",
          "Disponible": false
        },
        {
          "id": 22,
          "nom": "Boîtier de direction",
          "prix": 300,
          "categorie": "Direction",
          "Image": "image_boîtier_direction.jpg",
          "Disponible": true
        },
        {
          "id": 23,
          "nom": "Silent bloc de suspension",
          "prix": 35,
          "categorie": "Suspension",
          "Image": "image_silent_bloc_suspension.jpg",
          "Disponible": true
        },
        {
          "id": 24,
          "nom": "injecteur carburant",
          "prix": 160,
          "categorie": "Transmission",
          "Image": "image_injecteur_carburant.jpg",
          "Disponible": true
        },
        {
          "id": 25,
          "nom": "Sileimage cardan transmission",
          "prix": 50,
          "categorie": "Moteur",
          "Image": "image_sileimage_cardan_transmission.jpg",
          "Disponible": true
        }
      ]
    };
  },
  computed: {
    // Liste des catégories uniques
    categories() {
      return [...new Set(this.produits.map(produit => produit.categorie))];
    },
    // Produits filtrés et triés
    filteredProduits() {
      let produits = this.produits;

      // Filtrage par recherche
      if (this.searchQuery) {
        produits = produits.filter(produit =>
          produit.nom.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      // Filtrage par catégorie
      if (this.filterByCategory !== 'all') {
        produits = produits.filter(produit =>
          produit.categorie === this.filterByCategory
        );
      }

      // Filtrage par disponibilité
      if (this.filterByAvailability === 'available') {
        produits = produits.filter(produit => produit.Disponible);
      } else if (this.filterByAvailability === 'unavailable') {
        produits = produits.filter(produit => !produit.Disponible);
      }

      // Tri par prix
      if (this.sortOrder === 'asc') {
        produits.sort((a, b) => a.prix - b.prix); // Prix croissant
      } else if (this.sortOrder === 'desc') {
        produits.sort((a, b) => b.prix - a.prix); // Prix décroissant
      }

      return produits;
    },
    // Calcul du prix total du panier
    prixTotal() {
      return this.panier.reduce((total, item) => total + item.produit.prix * item.quantite, 0);
    }
  },
  methods: {
    // Ajouter un produit au panier
    ajouterAuPanier(produit) {
      const index = this.panier.findIndex(item => item.produit.id === produit.id);
      if (index !== -1) {
        // Si le produit est déjà dans le panier, augmenter la quantité
        this.panier[index].quantite++;
      } else {
        // Sinon, ajouter le produit au panier avec une quantité de 1
        this.panier.push({ produit, quantite: 1 });
      }
    },
    // Supprimer un produit du panier ou décrémenter la quantité
    supprimerDuPanier(index) {
      if (this.panier[index].quantite > 1) {
        // Si la quantité est supérieure à 1, décrémenter la quantité
        this.panier[index].quantite--;
      } else {
        // Si la quantité est égale à 1, supprimer le produit du panier
        this.panier.splice(index, 1);
      }
    }
  }
};
</script>

<style>
/* 🌟 Style global */
body {
  max-width: 1200px;
  margin: auto;
  padding: 16px;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
}

/* 🌟 En-tête */
header {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #6C63FF;
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

header .logo-container {
  display: flex;
  align-items: center;
}

header img {
  height: 50px;
  margin-right: 12px;
}

header h1 {
  font-size: 28px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Organisation principale */
main {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}

/*  Filtres */
.filtres {
  width: 280px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.filtres h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  color: #6C63FF;
}

.input-container {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 10px;
}

.filtres input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 8px;
  font-size: 14px;
  outline: none;
}

.filter-section {
  margin-top: 20px;
}

.filter-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #6C63FF;
}

.filter-section select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
}

/*  Section Produits */
.fiches {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/*  Style des Produits */
.produit {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease-in-out;
}

.produit:hover {
  transform: scale(1.03);
}

.produit img {
  max-width: 100px;
  height: auto;
  margin-bottom: 10px;
}

.produit h3 {
  font-size: 18px;
  font-weight: 600;
}

.prix {
  font-size: 16px;
  font-weight: bold;
  color: #6C63FF;
}

.disponible {
  color: #28a745;
  font-weight: bold;
}

.indisponible {
  color: #dc3545;
  font-weight: bold;
}

/* Panier */
.panier {
  width: 280px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.panier h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  color: #6C63FF;
}

.panier-item {
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.panier-item h4 {
  font-size: 16px;
  font-weight: 600;
}

.panier-item p {
  margin: 5px 0;
}

.panier-item button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.panier-item button:hover {
  background-color: #c82333;
}

.prix-total {
  font-size: 18px;
  font-weight: bold;
  color: #6C63FF;
  margin-top: 10px;
}
.but{
  color:white;
  background-color:green;
  border:green;
  border-radius:2px;

}
</style>