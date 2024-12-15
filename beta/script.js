import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuration Firebase (Remplacez par votre configuration)
const firebaseConfig = {
    apiKey: "AIzaSyCNiyVW5DgsvqIR2eAlQ2Ls02DuliFWOOI",
    authDomain: "immo-75593.firebaseapp.com",
    databaseURL: "https://immo-75593-default-rtdb.firebaseio.com",
    projectId: "immo-75593",
    storageBucket: "immo-75593.firebasestorage.app",
    messagingSenderId: "146632846661",
    appId: "1:146632846661:web:d63ca5c24f5b4acdeea22c",
    measurementId: "G-52KYCJZSHE"
  };

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// État de l'authentification
let isAuthenticated = false;

// Gestion de l'authentification
const authSection = document.getElementById("auth-section");
const loginFormContainer = document.getElementById("login-form-container");
const registerFormContainer = document.getElementById("register-form-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

// Récupérer les données utilisateur de localStorage au chargement de la page
let currentUser = null;
const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
  currentUser = JSON.parse(storedUser);
  isAuthenticated = true;
}

// Basculer entre les formulaires de connexion et d'inscription
showRegisterLink.addEventListener("click", () => {
  loginFormContainer.style.display = "none";
  registerFormContainer.style.display = "block";
});

showLoginLink.addEventListener("click", () => {
  registerFormContainer.style.display = "none";
  loginFormContainer.style.display = "block";
});

// Inscription
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showLoading();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    // Hasher le mot de passe (simple exemple, utilisez une méthode plus sécurisée en production)
    const hashedPassword = simpleHash(password);

    // Enregistrer l'utilisateur dans Firebase
    const usersRef = ref(database, 'users');
    await push(usersRef, {
      username: username,
      password: hashedPassword,
      role: 'user' // Attribuer un rôle par défaut
    });

    alert("Inscription réussie !");
    registerForm.reset();
    showLoginForm(); // Affiche le formulaire de connexion après l'inscription
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    alert("Erreur lors de l'inscription.");
  } finally {
    hideLoading();
  }
});

// Fonction pour afficher le formulaire de connexion
function showLoginForm() {
  registerFormContainer.style.display = "none";
  loginFormContainer.style.display = "block";
}

// Connexion
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showLoading();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      let userFound = false;
      for (const userId in users) {
        const user = users[userId];
        // Comparer le mot de passe haché
        if (user.username === username && user.password === simpleHash(password)) {
          // Stocker les informations de l'utilisateur
          currentUser = {
            id: userId,
            username: user.username,
            role: user.role, // Récupérer le rôle
            subscription: user.subscription || {}
            // ... autres informations si nécessaires ...
          };
          isAuthenticated = true;
          // Stocker les données utilisateur dans localStorage
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          checkUserRoleAndSubscription();
          hideAuthSection();
          loadDashboardData();
          initializeDataLoad(); // Initialiser le chargement des données ici
          userFound = true;
          break;
        }
      }
      if (!userFound) {
        alert("Pseudo ou mot de passe incorrect.");
      }
    } else {
      alert("Aucun utilisateur trouvé.");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    alert("Erreur lors de la connexion.");
  } finally {
    hideLoading();
  }
});

// Fonction pour vérifier et mettre à jour le statut de l'abonnement
async function checkAndUpdateSubscriptionStatus() {
    if (currentUser && currentUser.subscription) {
      const today = new Date();
      const subscriptionEndDate = new Date(currentUser.subscription.endDate);
  
      if (today > subscriptionEndDate) {
        // Abonnement expiré
        currentUser.subscription.status = "expired";
        await update(ref(database, `users/${currentUser.id}/subscription`), {
          status: "expired",
        });
  
        // Mettre à jour localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
  
        // Alerter l'utilisateur
        alert(
          "Votre abonnement a expiré. Veuillez renouveler votre abonnement pour continuer à utiliser les fonctionnalités premium."
        );
  
        checkUserRoleAndSubscription(); // Mettre à jour l'interface utilisateur
      } else {
        // Vérifier si l'abonnement expire bientôt (par exemple, dans 2 jours)
        const daysUntilExpiration = Math.round(
          (subscriptionEndDate - today) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiration <= 2) {
          alert(
            `Votre abonnement expirera dans ${daysUntilExpiration} jour(s). Pensez à le renouveler.`
          );
        }
      }
    }
  }

function checkUserRoleAndSubscription() {
    if (currentUser) {
      // Vérifier le rôle
      const isAdmin = currentUser.role === "admin";
      const addProprietaireBtn = document.getElementById("add-proprietaire-btn");
      const addMaisonBtn = document.getElementById("add-maison-btn");
      const addLocataireBtn = document.getElementById("add-locataire-btn");
      const addSouscriptionBtn = document.getElementById("add-souscription-btn");
  
      if (addProprietaireBtn) {
        addProprietaireBtn.style.display = isAdmin ? "block" : "none";
      }
      if (addMaisonBtn) {
        addMaisonBtn.style.display = isAdmin ? "block" : "none";
      }
      if (addLocataireBtn) {
        addLocataireBtn.style.display = isAdmin ? "block" : "none";
      }
      if (addSouscriptionBtn) {
        addSouscriptionBtn.style.display = isAdmin ? "block" : "none";
      }
  
      // Vérifier l'abonnement
      const userSubscription = currentUser.subscription;
      const isSubscribed =
        userSubscription && userSubscription.status === "active";
      const subscribeBtn = document.getElementById("subscribe-monthly-btn");
      const subscribeAnnuelBtn = document.getElementById("subscribe-yearly-btn")
      const cancelSubscriptionBtn = document.getElementById(
        "cancel-subscription-btn"
      );
      const trialInfo = document.getElementById("trial-info");
  
      if (isSubscribed) {
        // Utilisateur abonné
        document.getElementById("abonnement-status-text").textContent = "Abonné";
        subscribeBtn.style.display = "none";
        subscribeAnnuelBtn.style.display = "none";
        cancelSubscriptionBtn.style.display = "block";
        trialInfo.style.display = "none";
      } else {
        // Utilisateur non abonné
        document.getElementById("abonnement-status-text").textContent =
          "Non abonné";
        subscribeBtn.style.display = "block";
        subscribeAnnuelBtn.style.display = "block";
        cancelSubscriptionBtn.style.display = "none";
        trialInfo.style.display = "block";
      }
      // Mettre à jour localStorage avec le statut de l'abonnement
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
  }

// Fonction pour hacher le mot de passe (méthode simple pour l'exemple)
function simpleHash(str) {
let hash = 0;
for (let i = 0; i < str.length; i++) {
const char = str.charCodeAt(i);
hash = (hash << 5) - hash + char;
hash |= 0; // Convertir en entier 32bit
}
return hash.toString();
}

// Fonction pour afficher l'interface utilisateur après la connexion
function showMainInterface() {
authSection.style.display = "none";
// Afficher les autres sections de l'application
// ...
}

// Fonction pour masquer la section d'authentification
function hideAuthSection() {
authSection.style.display = "none";
}

// Gestion des onglets
const tabs = document.querySelectorAll(".nav-button");
const contentSections = document.querySelectorAll(".content-section");

// Gestion des onglets
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
  
      // Vérifier l'accès avant de changer d'onglet
      checkUserAccess(target);
  
      // Mettre à jour l'état des boutons de navigation
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active"); // Activer l'onglet cliqué
    });
  });

// Fonctions pour afficher/masquer le chargement
function showLoading() {
document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoading() {
document.getElementById("loading-overlay").style.display = "none";
}

// Gestion des formulaires d'ajout
const addProprietaireBtn = document.getElementById("add-proprietaire-btn");
const addMaisonBtn = document.getElementById("add-maison-btn");
const addLocataireBtn = document.getElementById("add-locataire-btn");
const addSouscriptionBtn = document.getElementById("add-souscription-btn");

const addProprietaireForm = document.getElementById("add-proprietaire-form");
const addMaisonForm = document.getElementById("add-maison-form");
const addLocataireForm = document.getElementById("add-locataire-form");
const addSouscriptionForm = document.getElementById("add-souscription-form");

const cancelProprietaireBtn = document.getElementById("cancel-proprietaire-btn");
const cancelMaisonBtn = document.getElementById("cancel-maison-btn");
const cancelLocataireBtn = document.getElementById("cancel-locataire-btn");
const cancelSouscriptionBtn = document.getElementById("cancel-souscription-btn");

// Fonctions pour afficher/masquer les formulaires
function showForm(form) {
form.classList.add("active");
}

function hideForm(form) {
form.classList.remove("active");
form.reset();
}

// Événements pour afficher les formulaires
addProprietaireBtn.addEventListener("click", () => showForm(addProprietaireForm));
addMaisonBtn.addEventListener("click", () => showForm(addMaisonForm));
addLocataireBtn.addEventListener("click", () => showForm(addLocataireForm));
addSouscriptionBtn.addEventListener("click", () => showForm(addSouscriptionForm));

// Événements pour masquer les formulaires
cancelProprietaireBtn.addEventListener("click", () => hideForm(addProprietaireForm));
cancelMaisonBtn.addEventListener("click", () => hideForm(addMaisonForm));
cancelLocataireBtn.addEventListener("click", () => hideForm(addLocataireForm));
cancelSouscriptionBtn.addEventListener("click", () => hideForm(addSouscriptionForm));

// Gestion du formulaire d'ajout de propriétaire
addProprietaireForm.addEventListener("submit", (event) => {
event.preventDefault();
showLoading();

const nom = document.getElementById("proprietaire-nom").value;
const prenom = document.getElementById("proprietaire-prenom").value;
const contact = document.getElementById("proprietaire-contact").value;
const email = document.getElementById("proprietaire-email").value;
const adresse = document.getElementById("proprietaire-adresse").value;

addProprietaire(nom, prenom, contact, email, adresse)
.then(() => {
    hideForm(addProprietaireForm);
    loadProprietaires(); // Recharger la liste
})
.catch((error) => {
    console.error("Erreur lors de l'ajout du propriétaire:", error);
    alert("Erreur lors de l'ajout du propriétaire.");
})
.finally(() => {
    hideLoading();
});
});

// Gestion du formulaire d'ajout de maison
addMaisonForm.addEventListener("submit", (event) => {
event.preventDefault();
showLoading();

const proprietaireId = document.getElementById("maison-proprietaire").value;
const type = document.getElementById("maison-type").value;
const pieces = parseInt(document.getElementById("maison-pieces").value);
const ville = document.getElementById("maison-ville").value;
const commune = document.getElementById("maison-commune").value;
const quartier = document.getElementById("maison-quartier").value;
const loyer = parseInt(document.getElementById("maison-loyer").value);

addMaison(proprietaireId, type, pieces, ville, commune, quartier, loyer)
.then(() => {
    hideForm(addMaisonForm);
    loadMaisons(); // Recharger la liste
})
.catch((error) => {
    console.error("Erreur lors de l'ajout de la maison:", error);
    alert("Erreur lors de l'ajout de la maison.");
})
.finally(() => {
    hideLoading();
});
});

// Gestion du formulaire d'ajout de locataire
addLocataireForm.addEventListener("submit", (event) => {
event.preventDefault();
showLoading();

const nom = document.getElementById("locataire-nom").value;
const prenom = document.getElementById("locataire-prenom").value;
const contact = document.getElementById("locataire-contact").value;
const email = document.getElementById("locataire-email").value;

addLocataire(nom, prenom, contact, email)
.then(() => {
    hideForm(addLocataireForm);
    loadLocataires(); // Recharger la liste
})
.catch((error) => {
    console.error("Erreur lors de l'ajout du locataire:", error);
    alert("Erreur lors de l'ajout du locataire.");
})
.finally(() => {
    hideLoading();
});
});

// Gestion du formulaire d'ajout de souscription
addSouscriptionForm.addEventListener("submit", (event) => {
event.preventDefault();
showLoading();

const maisonId = document.getElementById("souscription-maison").value;
const locataireId = document.getElementById("souscription-locataire").value;
const caution = parseInt(document.getElementById("souscription-caution").value);
const avance = parseInt(document.getElementById("souscription-avance").value);
const autres = document.getElementById("souscription-autres").value;
const dateDebut = document.getElementById("souscription-date-debut").value;

addSouscription(maisonId, locataireId, caution, avance, autres, dateDebut)
.then(() => {
    hideForm(addSouscriptionForm);
    loadSouscriptions(); // Recharger la liste
})
.catch((error) => {
    console.error("Erreur lors de l'ajout de la souscription:", error);
    alert("Erreur lors de l'ajout de la souscription.");
})
.finally(() => {
    hideLoading();
});
});

// Fonctions pour ajouter des données à Firebase (à adapter à votre structure de données)
async function addProprietaire(nom, prenom, contact, email, adresse) {
const proprietairesRef = ref(database, 'proprietaires');
const newProprietaireRef = push(proprietairesRef);
await set(newProprietaireRef, {
nom: nom,
prenom: prenom,
contact: contact,
email: email,
adresse: adresse
});
}

async function addMaison(proprietaireId, type, pieces, ville, commune, quartier, loyer) {
const maisonsRef = ref(database, 'maisons');
const newMaisonRef = push(maisonsRef);
await set(newMaisonRef, {
proprietaire: proprietaireId,
type: type,
pieces: pieces,
ville: ville,
commune: commune,
quartier: quartier,
loyer: loyer
});
}

async function addLocataire(nom, prenom, contact, email) {
const locatairesRef = ref(database, 'locataires');
const newLocataireRef = push(locatairesRef);
await set(newLocataireRef, {
nom: nom,
prenom: prenom,
contact: contact,
email: email
});
}

async function addSouscription(maisonId, locataireId, caution, avance, autres, dateDebut) {
const souscriptionsRef = ref(database, 'souscriptions');
const newSouscriptionRef = push(souscriptionsRef);
const maisonRef = ref(database, `maisons/${maisonId}`);
const maisonSnapshot = await get(maisonRef);
const loyer = maisonSnapshot.val().loyer;

await set(newSouscriptionRef, {
maison: maisonId,
locataire: locataireId,
caution: caution,
avance: avance,
autres: autres,
dateDebut: dateDebut,
loyer: loyer
});
}

function loadProprietaires() {
    showLoading();
    const proprietairesList = document.querySelector("#proprietaires-list tbody");
    proprietairesList.innerHTML = "";

    const proprietairesRef = ref(database, 'proprietaires');
    onValue(proprietairesRef, (snapshot) => {
        const proprietaires = snapshot.val();
        let proprietairesCount = 0;
        let index = 1; // Initialiser le compteur
        for (const proprietaireId in proprietaires) {
            proprietairesCount++;
            const proprietaire = proprietaires[proprietaireId];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index}</td> 
                <td>${proprietaire.nom}</td>
                <td>${proprietaire.prenom}</td>
                <td>${proprietaire.contact}</td>
                <td>${proprietaire.email}</td>
                <td>${proprietaire.adresse}</td>
                <td class="actions-cell">
                    <button class="edit-btn" data-id="${proprietaireId}">Modifier</button>
                    <button class="delete-btn" data-id="${proprietaireId}">Supprimer</button>
                </td>
            `;
            proprietairesList.appendChild(row);
            index++; // Incrémenter le compteur après chaque ligne
        }
        document.getElementById('dashboard-proprietaires-count').textContent = proprietairesCount;
        hideLoading();
    }, {
        onlyOnce: true
    });
}

function loadMaisons() {
    showLoading();
    const maisonsList = document.querySelector("#maisons-list tbody");
    maisonsList.innerHTML = "";

    const maisonsRef = ref(database, 'maisons');
    onValue(maisonsRef, (snapshot) => {
        const maisons = snapshot.val();
        let maisonsCount = 0;
        let index = 1; // Initialiser le compteur

        // Mettre à jour la liste déroulante des propriétaires
        const proprietaireSelect = document.getElementById("maison-proprietaire");
        proprietaireSelect.innerHTML = '<option value="">Sélectionner Propriétaire</option>';
        const proprietairesRef = ref(database, 'proprietaires');
        get(proprietairesRef).then((proprietairesSnapshot) => {
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
            get(ref(database, `proprietaires/${maison.proprietaire}`)).then((proprietaireSnapshot) => {
                const proprietaire = proprietaireSnapshot.val();
                const proprietaireNom = proprietaire ? `${proprietaire.nom} ${proprietaire.prenom}` : 'Propriétaire inconnu';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index}</td> 
                    <td>${proprietaireNom}</td>
                    <td>${maison.type}</td>
                    <td>${maison.pieces}</td>
                    <td>${maison.ville}, ${maison.commune}, ${maison.quartier}</td>
                    <td>${maison.loyer}</td>
                    <td class="actions-cell">
                        <button class="edit-btn" data-id="${maisonId}">Modifier</button>
                        <button class="delete-btn" data-id="${maisonId}">Supprimer</button>
                    </td>
                `;
                maisonsList.appendChild(row);
                index++; // Incrémenter le compteur
            });
        }
        document.getElementById('dashboard-maisons-count').textContent = maisonsCount;
        hideLoading();
    }, {
        onlyOnce: true
    });
}

function loadLocataires() {
  showLoading();
  const locatairesList = document.querySelector("#locataires-list tbody");
  locatairesList.innerHTML = "";

  const locatairesRef = ref(database, 'locataires');
  onValue(locatairesRef, (snapshot) => {
      const locataires = snapshot.val();
      let locatairesCount = 0;
      let index = 1; // Initialiser le compteur
      for (const locataireId in locataires) {
          locatairesCount++;
          const locataire = locataires[locataireId];
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index}</td> 
              <td>${locataire.nom}</td>
              <td>${locataire.prenom}</td>
              <td>${locataire.contact}</td>
              <td>${locataire.email}</td>
              <td class="actions-cell">
                  <button class="edit-btn" data-id="${locataireId}">Modifier</button>
                  <button class="delete-btn" data-id="${locataireId}">Supprimer</button>
              </td>
          `;
          locatairesList.appendChild(row);
          index++; // Incrémenter le compteur
      }
      document.getElementById('dashboard-locataires-count').textContent = locatairesCount;
      hideLoading();
  }, {
      onlyOnce: true
  });
}

function loadSouscriptions() {
  showLoading();
  const souscriptionsList = document.querySelector("#souscriptions-list tbody");
  souscriptionsList.innerHTML = "";

  // Mettre à jour la liste déroulante des maisons
  const maisonSelect = document.getElementById("souscription-maison");
  maisonSelect.innerHTML = '<option value="">Sélectionner Maison</option>';
  const maisonsRef = ref(database, 'maisons');
  get(maisonsRef).then((maisonsSnapshot) => {
      const maisons = maisonsSnapshot.val();
      for (const maisonId in maisons) {
          const maison = maisons[maisonId];
          const option = document.createElement("option");
          option.value = maisonId;
          option.text = `${maisonId} - ${maison.ville}, ${maison.commune}, ${maison.quartier}`;
          maisonSelect.appendChild(option);
      }
  });

  // Mettre à jour la liste déroulante des locataires
  const locataireSelect = document.getElementById("souscription-locataire");
  locataireSelect.innerHTML = '<option value="">Sélectionner Locataire</option>';
  const locatairesRef = ref(database, 'locataires');
  get(locatairesRef).then((locatairesSnapshot) => {
      const locataires = locatairesSnapshot.val();
      for (const locataireId in locataires) {
          const locataire = locataires[locataireId];
          const option = document.createElement("option");
          option.value = locataireId;
          option.text = `${locataire.nom} ${locataire.prenom}`;
          locataireSelect.appendChild(option);
      }
  });

  const souscriptionsRef = ref(database, 'souscriptions');
  onValue(souscriptionsRef, (snapshot) => {
      const souscriptions = snapshot.val();
      let souscriptionsCount = 0;
      let index = 1; // Initialiser le compteur
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
              <td class="actions-cell">
                  <button class="edit-btn" data-id="${souscriptionId}">Modifier</button>
                  <button class="delete-btn" data-id="${souscriptionId}">Supprimer</button>
              </td>
          `;
          souscriptionsList.appendChild(row);
          index++; // Incrémenter le compteur
      }
      document.getElementById('dashboard-souscriptions-count').textContent = souscriptionsCount;
      hideLoading();
  }, {
      onlyOnce: true
  });
}

// Délégation d'événements pour les boutons "Modifier" et "Supprimer"
document.querySelector("#proprietaires-list tbody").addEventListener("click", handleEditDelete);
document.querySelector("#maisons-list tbody").addEventListener("click", handleEditDelete);
document.querySelector("#locataires-list tbody").addEventListener("click", handleEditDelete);
document.querySelector("#souscriptions-list tbody").addEventListener("click", handleEditDelete);

function handleEditDelete(event) {
const target = event.target;
if (target.classList.contains("edit-btn")) {
const itemId = target.dataset.id;
const itemType = target.closest(".content-section").id;
// **À COMPLÉTER : Implémenter la logique de modification (ouvrir un formulaire, etc.)**
console.log("Modifier", itemType, itemId);
} else if (target.classList.contains("delete-btn")) {
const itemId = target.dataset.id;
const itemType = target.closest(".content-section").id;
deleteItem(itemType, itemId);
}
}

// Fonction pour supprimer un élément
async function deleteItem(itemType, itemId) {
showLoading();
try {
const itemRef = ref(database, `${itemType}/${itemId}`);
await remove(itemRef);
// Recharger la liste après la suppression
if (itemType === 'proprietaires') {
  loadProprietaires();
} else if (itemType === 'maisons') {
  loadMaisons();
} else if (itemType === 'locataires') {
  loadLocataires();
} else if (itemType === 'souscriptions') {
  loadSouscriptions();
}
} catch (error) {
console.error(`Erreur lors de la suppression de ${itemType}:`, error);
alert(`Erreur lors de la suppression de ${itemType}.`);
} finally {
hideLoading();
}
}

// Gestion des abonnements
const subscribeMonthlyBtn = document.getElementById("subscribe-monthly-btn");
const subscribeYearlyBtn = document.getElementById("subscribe-yearly-btn");
const cancelSubscriptionBtn = document.getElementById("cancel-subscription-btn");

// Abonnement mensuel
subscribeMonthlyBtn.addEventListener("click", () => {
handleSubscription("monthly");
});

// Abonnement annuel
subscribeYearlyBtn.addEventListener("click", () => {
handleSubscription("yearly");
});

async function handleSubscription(subscriptionType) {
  // Vérifier si l'utilisateur a déjà un abonnement actif
  if (
    currentUser &&
    currentUser.subscription &&
    currentUser.subscription.status === "active"
  ) {
    alert("Vous avez déjà un abonnement actif.");
    return;
  }

  const amount = subscriptionType === "monthly" ? 1000 : 10000; // Correction: 1000 pour mensuel
  const description =
    subscriptionType === "monthly"
      ? "Abonnement mensuel à la plateforme de gestion locative"
      : "Abonnement annuel à la plateforme de gestion locative";

  showLoading();
  FedaPay.init({
    public_key: "pk_live_TfSz212W0xSMKK7oPEogkFmp", // Remplacez par votre clé publique Fedapay
    transaction: {
      amount: amount,
      description: description,
    },
    customer: {
      email: "user@example.com", // Remplacez par l'email de l'utilisateur
    },
    onComplete: async function (transaction) {
      // Utilise transaction.reason pour obtenir la raison
      if (transaction.reason === FedaPay.CHECKOUT_COMPLETED) {
        // Calculer la date d'expiration
        const startDate = new Date();
        const endDate = new Date(
          subscriptionType === "monthly"
            ? startDate.getTime() + 30 * 24 * 60 * 60 * 1000
            : startDate.getTime() + 365 * 24 * 60 * 60 * 1000
        );

        // Enregistrez l'abonnement dans la base de données Firebase
        const subscriptionData = {
          status: "active",
          type: subscriptionType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
        await update(
          ref(database, `users/${currentUser.id}/subscription`),
          subscriptionData
        );

        // Mettre à jour l'état de l'utilisateur courant
        if (currentUser) {
          currentUser.subscription = subscriptionData;
          // Mettre à jour localStorage
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

        checkUserRoleAndSubscription();
        alert(
          `Abonnement ${
            subscriptionType === "monthly" ? "mensuel" : "annuel"
          } réussi!`
        );
        loadDashboardData();
      } else if (transaction.reason === FedaPay.DIALOG_DISMISSED) {
        alert("Paiement annulé.");
      } else {
        console.log("Transaction : ", transaction);
        alert("Erreur lors du paiement. Veuillez réessayer.");
      }
    },
  }).open();
  hideLoading();
}

// Fonction pour charger les données du tableau de bord
async function loadDashboardData() {
if (!isAuthenticated) return;

// Charger le nombre de propriétaires
const proprietairesRef = ref(database, 'proprietaires');
onValue(proprietairesRef, (snapshot) => {
const proprietaires = snapshot.val();
const proprietairesCount = proprietaires ? Object.keys(proprietaires).length : 0;
document.getElementById('dashboard-proprietaires-count').textContent = proprietairesCount;
});

// Charger le nombre de locataires
const locatairesRef = ref(database, 'locataires');
onValue(locatairesRef, (snapshot) => {
const locataires = snapshot.val();
const locatairesCount = locataires ? Object.keys(locataires).length : 0;
document.getElementById('dashboard-locataires-count').textContent = locatairesCount;
});

// Charger le nombre de maisons
const maisonsRef = ref(database, 'maisons');
onValue(maisonsRef, (snapshot) => {
const maisons = snapshot.val();
const maisonsCount = maisons ? Object.keys(maisons).length : 0;
document.getElementById('dashboard-maisons-count').textContent = maisonsCount;
});

// Charger le nombre de souscriptions
const souscriptionsRef = ref(database, 'souscriptions');
onValue(souscriptionsRef, (snapshot) => {
const souscriptions = snapshot.val();
const souscriptionsCount = souscriptions ? Object.keys(souscriptions).length : 0;
document.getElementById('dashboard-souscriptions-count').textContent = souscriptionsCount;
});

// Charger le nombre d'abonnements actifs
const usersRef = ref(database, 'users');
onValue(usersRef, (snapshot) => {
const users = snapshot.val();
let activeSubscriptionsCount = 0;
for (const userId in users) {
  const user = users[userId];
  if (user.subscription && user.subscription.status === 'active') {
      activeSubscriptionsCount++;
  }
}
document.getElementById('dashboard-abonnements-count').textContent = activeSubscriptionsCount;
});
}

// Appeler la fonction pour démarrer la période d'essai
async function startTrial() {
if (currentUser && currentUser.subscription && currentUser.subscription.status === 'trial') {
alert("Vous avez déjà une période d'essai en cours.");
return;
}
const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours à partir de maintenant
const trialData = {
status: 'trial',
startDate: new Date().toISOString(),
endDate: trialEndDate.toISOString()
};

await update(ref(database, `users/${currentUser.id}/subscription`), trialData);
if (currentUser) {
currentUser.subscription = trialData;
// Mettre à jour localStorage
localStorage.setItem('currentUser', JSON.stringify(currentUser));
}
checkUserRoleAndSubscription();
alert("Période d'essai de 7 jours activée !");
loadDashboardData(); // Rechargez les données pour mettre à jour le statut de l'abonnement
}

// Utilisation de la fonction startTrial lorsque l'utilisateur clique sur le bouton "S'abonner"
subscribeBtn.addEventListener('click', () => {
// Vérifier si l'utilisateur a déjà un abonnement actif
if (currentUser && currentUser.subscription && currentUser.subscription.status === 'active') {
alert("Vous avez déjà un abonnement actif.");
return;
}

// Proposer à l'utilisateur de démarrer une période d'essai ou de s'abonner directement
if (confirm("Voulez-vous démarrer une période d'essai gratuite de 7 jours ?")) {
startTrial();
} else {
// Initialiser le paiement Fedapay pour l'abonnement
initFedapayPayment();
}
});

cancelSubscriptionBtn.addEventListener("click", async () => {
  if (currentUser && currentUser.subscription) {
      if (confirm("Êtes-vous sûr de vouloir annuler votre abonnement ?")) {
        // Mettre à jour le statut de l'abonnement dans Firebase
        await update(ref(database, `users/${currentUser.id}/subscription`), { status: 'cancelled' });
    
        // Mettre à jour l'état de l'utilisateur courant
        currentUser.subscription.status = 'cancelled';
        
        // Mettre à jour localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
        checkUserRoleAndSubscription();
    
        alert('Abonnement annulé.');
        loadDashboardData(); // Rechargez les données pour mettre à jour le statut de l'abonnement
      }
    } else {
      alert('Vous n\'avez pas d\'abonnement actif à annuler.');
    }
    });
    
    // Fonction de déconnexion
    function logout() {
      localStorage.removeItem('currentUser');
      isAuthenticated = false;
      currentUser = null;
      // Rediriger vers la page de connexion ou actualiser la page
      window.location.href = 'index.html'; // Redirection vers la page de connexion
    }
    
    // Ajout d'un bouton de déconnexion (exemple)
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-btn';
    logoutButton.textContent = 'Déconnexion';
    document.body.appendChild(logoutButton); // Ajoutez-le à l'endroit approprié dans votre HTML
    
    // Gestionnaire d'événement pour la déconnexion
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    function checkUserAccess(targetSectionId = null) {
      if (currentUser && currentUser.subscription && (currentUser.subscription.status === 'active' || currentUser.subscription.status === 'trial')) {
        // Utilisateur autorisé - ne rien faire
        if (targetSectionId) {
          // Afficher la section cible
          contentSections.forEach(s => s.classList.remove("active"));
          document.getElementById(targetSectionId).classList.add("active");
        }
      } else {
        // Utilisateur non autorisé - rediriger vers la section d'abonnement
        alert("Vous devez avoir un abonnement actif ou une période d'essai pour accéder à cette section.");
        contentSections.forEach(s => s.classList.remove("active"));
        document.getElementById("abonnements").classList.add("active"); // Afficher la section d'abonnement
    
        // Mettre à jour l'état du bouton de navigation "Abonnements"
        tabs.forEach(t => t.classList.remove("active"));
        const abonnementTab = document.querySelector('[data-target="abonnements"]');
        if (abonnementTab) {
          abonnementTab.classList.add("active");
        }
      }
    }
    // Initialisation du chargement des données
    function initializeDataLoad() {
      if (isAuthenticated) {
        checkUserRoleAndSubscription();
        checkAndUpdateSubscriptionStatus()
        loadDashboardData();
        loadProprietaires();
        loadMaisons();
        loadLocataires();
        loadSouscriptions();
      }
    }
    
    // Appeler initializeDataLoad au chargement de la page
    initializeDataLoad();
