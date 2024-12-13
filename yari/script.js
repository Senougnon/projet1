// Configuration Firebase (Remplacez par votre configuration)
const firebaseConfig = {
    apiKey: "AIzaSyAzf5NGjh-AZ-xVygKknnJ2Jb2ctW0Alc4",
    authDomain: "test-4ef80.firebaseapp.com",
    databaseURL: "https://test-4ef80-default-rtdb.firebaseio.com",
    projectId: "test-4ef80",
    storageBucket: "test-4ef80.firebasestorage.app",
    messagingSenderId: "1000649890652",
    appId: "1:1000649890652:web:08d0152ba1098c7e57bf99",
    measurementId: "G-ZS30CDLMZ4"
  };
  
  // Initialiser Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // ID simples pour le prototype
  let proprietaireIdCounter = 1;
  let maisonIdCounter = 1;
  let locataireIdCounter = 1;
  let souscriptionIdCounter = 1;
  
  // Fonction pour ajouter un propriétaire à Firebase
  function addProprietaire(nom, prenom, contact, email, adresse) {
      const proprietaireId = `P${proprietaireIdCounter++}`;
      const proprietaireData = {
          nom: nom,
          prenom: prenom,
          contact: contact,
          email: email,
          adresse: adresse
      };
  
      // **À COMPLÉTER : Enregistrer le propriétaire dans Firebase**
       database.ref('proprietaires/' + proprietaireId).set(proprietaireData);
      console.log("Propriétaire ajouté:", proprietaireId, proprietaireData);
  }
  
  // Fonction pour ajouter une maison à Firebase
  function addMaison(proprietaireId, type, pieces, ville, commune, quartier, loyer) {
      const maisonId = `M${maisonIdCounter++}`;
      const maisonData = {
          proprietaire: proprietaireId,
          type: type,
          pieces: pieces,
          ville: ville,
          commune: commune,
          quartier: quartier,
          loyer: loyer
      };
  
      // **À COMPLÉTER : Enregistrer la maison dans Firebase**
       database.ref('maisons/' + maisonId).set(maisonData);
      console.log("Maison ajoutée:", maisonId, maisonData);
  }
  
  // Fonction pour ajouter un locataire à Firebase
  function addLocataire(nom, prenom, contact, email) {
      const locataireId = `L${locataireIdCounter++}`;
      const locataireData = {
          nom: nom,
          prenom: prenom,
          contact: contact,
          email: email
      };
  
      // **À COMPLÉTER : Enregistrer le locataire dans Firebase**
      database.ref('locataires/' + locataireId).set(locataireData);
      console.log("Locataire ajouté:", locataireId, locataireData);
  }
  
  // Fonction pour ajouter une souscription à Firebase
  function addSouscription(maisonId, locataireId, caution, avance, autres, dateDebut) {
      const souscriptionId = `S${souscriptionIdCounter++}`;
      const souscriptionData = {
          maison: maisonId,
          locataire: locataireId,
          caution: caution,
          avance: avance,
          autres: autres,
          dateDebut: dateDebut,
          loyer: 0 // Loyer à récupérer depuis la maison
      };
  
      // Récupérer le loyer de la maison depuis Firebase
      // **À COMPLÉTER : Récupérer le loyer et mettre à jour souscriptionData**
       database.ref('maisons/' + maisonId + '/loyer').once('value').then((snapshot) => {
          souscriptionData.loyer = snapshot.val();
  
          // Enregistrer la souscription dans Firebase
          database.ref('souscriptions/' + souscriptionId).set(souscriptionData);
          console.log("Souscription ajoutée:", souscriptionId, souscriptionData);
      });
      console.log("Souscription ajoutée:", souscriptionId, souscriptionData);
  }
  
  // Gestion des onglets
  const tabs = document.querySelectorAll(".tab");
  const contentSections = document.querySelectorAll(".content-section");
  
  tabs.forEach(tab => {
      tab.addEventListener("click", () => {
          const target = tab.dataset.target;
  
          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
  
          contentSections.forEach(s => s.classList.remove("active"));
          document.getElementById(target).classList.add("active");
      });
  });
  
  // Gestion du formulaire d'ajout de propriétaire
  const addProprietaireForm = document.getElementById("add-proprietaire-form");
  addProprietaireForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const nom = document.getElementById("proprietaire-nom").value;
      const prenom = document.getElementById("proprietaire-prenom").value;
      const contact = document.getElementById("proprietaire-contact").value;
      const email = document.getElementById("proprietaire-email").value;
      const adresse = document.getElementById("proprietaire-adresse").value;
  
      addProprietaire(nom, prenom, contact, email, adresse);
      
  });
  
  // Gestion du formulaire d'ajout de maison
  const addMaisonForm = document.getElementById("add-maison-form");
  addMaisonForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const proprietaireId = document.getElementById("maison-proprietaire").value;
      const type = document.getElementById("maison-type").value;
      const pieces = parseInt(document.getElementById("maison-pieces").value);
      const ville = document.getElementById("maison-ville").value;
      const commune = document.getElementById("maison-commune").value;
      const quartier = document.getElementById("maison-quartier").value;
      const loyer = parseInt(document.getElementById("maison-loyer").value);
  
      addMaison(proprietaireId, type, pieces, ville, commune, quartier, loyer);
  });
  
  // Gestion du formulaire d'ajout de locataire
  const addLocataireForm = document.getElementById("add-locataire-form");
  addLocataireForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const nom = document.getElementById("locataire-nom").value;
      const prenom = document.getElementById("locataire-prenom").value;
      const contact = document.getElementById("locataire-contact").value;
      const email = document.getElementById("locataire-email").value;
  
      addLocataire(nom, prenom, contact, email);
  });
  
  // Gestion du formulaire d'ajout de souscription
  const addSouscriptionForm = document.getElementById("add-souscription-form");
  addSouscriptionForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      const maisonId = document.getElementById("souscription-maison").value;
      const locataireId = document.getElementById("souscription-locataire").value;
      const caution = parseInt(document.getElementById("souscription-caution").value);
      const avance = parseInt(document.getElementById("souscription-avance").value);
      const autres = document.getElementById("souscription-autres").value;
      const dateDebut = document.getElementById("souscription-date-debut").value;
  
      addSouscription(maisonId, locataireId, caution, avance, autres, dateDebut);
  });
  
  // **À COMPLÉTER : Fonctions pour lire et afficher les données depuis Firebase**
  
  // Fonction pour charger et afficher les propriétaires
  function loadProprietaires() {
      const proprietairesList = document.querySelector("#proprietaires-list tbody");
      proprietairesList.innerHTML = ""; // Effacer la liste existante
      // **À COMPLÉTER : Lire les propriétaires depuis Firebase et les ajouter à la liste**
      database.ref('proprietaires/').on('value', (snapshot) => {
          const proprietaires = snapshot.val();
          let proprietairesCount = 0;
          for (const proprietaireId in proprietaires) {
              proprietairesCount++;
              const proprietaire = proprietaires[proprietaireId];
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${proprietaireId}</td>
                  <td>${proprietaire.nom}</td>
                  <td>${proprietaire.prenom}</td>
                  <td>${proprietaire.contact}</td>
                  <td>${proprietaire.email}</td>
                  <td>${proprietaire.adresse}</td>
              `;
              proprietairesList.appendChild(row);
          }
          document.getElementById('dashboard-proprietaires-count').textContent = proprietairesCount;
      });
  
  }
  
  // Fonction pour charger et afficher les maisons
  function loadMaisons() {
      const maisonsList = document.querySelector("#maisons-list tbody");
      maisonsList.innerHTML = ""; // Effacer la liste existante
  
      // **À COMPLÉTER : Lire les maisons depuis Firebase et les ajouter à la liste**
      database.ref('maisons/').on('value', (snapshot) => {
          const maisons = snapshot.val();
          let maisonsCount = 0;
  
          // Mettre à jour la liste déroulante des propriétaires dans le formulaire d'ajout de maison
          const proprietaireSelect = document.getElementById("maison-proprietaire");
          proprietaireSelect.innerHTML = '<option value="">Sélectionner Propriétaire</option>';
          database.ref('proprietaires/').once('value', (proprietairesSnapshot) => {
              const proprietaires = proprietairesSnapshot.val();
              for (const proprietaireId in proprietaires) {
                  const proprietaire = proprietaires[proprietaireId];
                  const option = document.createElement("option");
                  option.value = proprietaireId;
                  option.text = `${proprietaire.nom} ${proprietaire.prenom}`;
                  proprietaireSelect.appendChild(option);
              }
          });
  
          for (const maisonId in maisons) {
              maisonsCount++;
              const maison = maisons[maisonId];
  
              // Récupérer le nom du propriétaire
              database.ref('proprietaires/' + maison.proprietaire).once('value').then((proprietaireSnapshot) => {
                  const proprietaire = proprietaireSnapshot.val();
                  const proprietaireNom = proprietaire ? `${proprietaire.nom} ${proprietaire.prenom}` : 'Propriétaire inconnu';
  
                  const row = document.createElement("tr");
                  row.innerHTML = `
                      <td>${maisonId}</td>
                      <td>${proprietaireNom}</td>
                      <td>${maison.type}</td>
                      <td>${maison.pieces}</td>
                      <td>${maison.ville}, ${maison.commune}, ${maison.quartier}</td>
                      <td>${maison.loyer}</td>
                  `;
                  maisonsList.appendChild(row);
              });
          }
          document.getElementById('dashboard-maisons-count').textContent = maisonsCount;
      });
  }
  
  // Fonction pour charger et afficher les locataires
  function loadLocataires() {
      const locatairesList = document.querySelector("#locataires-list tbody");
      locatairesList.innerHTML = ""; // Effacer la liste existante
  
      // **À COMPLÉTER : Lire les locataires depuis Firebase et les ajouter à la liste**
      database.ref('locataires/').on('value', (snapshot) => {
          const locataires = snapshot.val();
          let locatairesCount = 0;
          for (const locataireId in locataires) {
              locatairesCount++;
              const locataire = locataires[locataireId];
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${locataireId}</td>
                  <td>${locataire.nom}</td>
                  <td>${locataire.prenom}</td>
                  <td>${locataire.contact}</td>
                  <td>${locataire.email}</td>
              `;
              locatairesList.appendChild(row);
          }
          document.getElementById('dashboard-locataires-count').textContent = locatairesCount;
      });
  }
  
  // Fonction pour charger et afficher les souscriptions
  function loadSouscriptions() {
      const souscriptionsList = document.querySelector("#souscriptions-list tbody");
      souscriptionsList.innerHTML = ""; // Effacer la liste existante
      
      // Mettre à jour la liste déroulante des maisons dans le formulaire d'ajout de souscription
      const maisonSelect = document.getElementById("souscription-maison");
      maisonSelect.innerHTML = '<option value="">Sélectionner Maison</option>';
      database.ref('maisons/').once('value', (maisonsSnapshot) => {
          const maisons = maisonsSnapshot.val();
          for (const maisonId in maisons) {
              const maison = maisons[maisonId];
              const option = document.createElement("option");
              option.value = maisonId;
              option.text = `${maisonId} - ${maison.ville}, ${maison.commune}, ${maison.quartier}`;
              maisonSelect.appendChild(option);
          }
      });
  
      // Mettre à jour la liste déroulante des locataires dans le formulaire d'ajout de souscription
      const locataireSelect = document.getElementById("souscription-locataire");
      locataireSelect.innerHTML = '<option value="">Sélectionner Locataire</option>';
      database.ref('locataires/').once('value', (locatairesSnapshot) => {
          const locataires = locatairesSnapshot.val();
          for (const locataireId in locataires) {
              const locataire = locataires[locataireId];
              const option = document.createElement("option");
              option.value = locataireId;
              option.text = `${locataire.nom} ${locataire.prenom}`;
              locataireSelect.appendChild(option);
          }
      });
      // **À COMPLÉTER : Lire les souscriptions depuis Firebase et les ajouter à la liste**
      database.ref('souscriptions/').on('value', (snapshot) => {
          const souscriptions = snapshot.val();
          let souscriptionsCount = 0;
          for (const souscriptionId in souscriptions) {
              souscriptionsCount++;
              const souscription = souscriptions[souscriptionId];
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${souscription.maison}</td>
                  <td>${souscription.locataire}</td>
                  <td>${souscription.caution}</td>
                  <td>${souscription.avance}</td>
                  <td>${souscription.autres}</td>
                  <td>${souscription.dateDebut}</td>
                  <td>${souscription.loyer}</td>
              `;
              souscriptionsList.appendChild(row);
          }
          document.getElementById('dashboard-souscriptions-count').textContent = souscriptionsCount;
      });
  }
  
  // Charger les données au chargement de la page
  loadProprietaires();
  loadMaisons();
  loadLocataires();
  loadSouscriptions();