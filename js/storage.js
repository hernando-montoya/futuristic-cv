// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCp2jYIjxzVpOVi1Il7VgHeuMCM8Qje9gA",
    authDomain: "futuristic-cv.firebaseapp.com",
    projectId: "futuristic-cv",
    storageBucket: "futuristic-cv.firebasestorage.app",
    messagingSenderId: "517726295696",
    appId: "1:517726295696:web:f2afd4a00ad5a30c706a15",
    measurementId: "G-41SL9TWMZQ"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase initialization error:", e);
}

const DEFAULT_DATA = {
    "id": "110b25d0-0915-4496-aebc-4978ba28d7ba",
    "personalInfo": {
        "name": "Hernando Montoya Oliveros",
        "title": "Senior Android Research & Development Engineer",
        "phone": "0623705866",
        "email": "contact@hernandomontoya.dev",
        "website": "hernandomontoya.dev",
        "profileImage": "https://customer-assets.emergentagent.com/job_responsive-vita/artifacts/x21fq5wh_profil.png"
    },
    "aboutDescription": {
        "en": "Specialized in building scalable Android applications and modern interfaces. Passionate about clean code, performance optimization, and user experience. Experienced in Kotlin, Jetpack Compose, and modern Android architecture.",
        "es": "Especializado en la construcción de aplicaciones Android escalables e interfaces modernas. Apasionado por el código limpio, la optimización del rendimiento y la experiencia del usuario. Experimentado en Kotlin, Jetpack Compose y arquitectura moderna de Android.",
        "fr": "Spécialisé dans la création d'applications Android évolutives et d'interfaces modernes. Passionné par le code propre, l'optimisation des performances et l'expérience utilisateur. Expérimenté en Kotlin, Jetpack Compose et architecture Android moderne."
    },
    "experiences": [
        {
            "id": "1",
            "title": "Développeur Android",
            "company": "Veepee",
            "location": "Full Remote",
            "period": "2022 – Present",
            "period_es": "2022 – Presente",
            "period_fr": "2022 – Présent",
            "description": {
                "en": [
                    "Developed and maintained Android applications for e-commerce platform",
                    "Implemented new features using Kotlin and Jetpack Compose",
                    "Optimized app performance and user experience"
                ],
                "es": [
                    "Desarrollé y mantuve aplicaciones Android para plataforma de comercio electrónico",
                    "Implementé nuevas funcionalidades usando Kotlin y Jetpack Compose",
                    "Optimicé el rendimiento de la aplicación y la experiencia del usuario"
                ],
                "fr": [
                    "Développé et maintenu des applications Android pour plateforme e-commerce",
                    "Implémenté de nouvelles fonctionnalités avec Kotlin et Jetpack Compose",
                    "Optimisé les performances de l'application et l'expérience utilisateur"
                ]
            }
        }
    ],
    "education": [
        {
            "id": "1",
            "year": "2025",
            "title": "The Complete Generative AI and Python Programming Bootcamp",
            "institution": "Udemy",
            "type": "certification"
        }
    ],
    "skills": {
        "languages": ["Kotlin", "Java", "JavaScript", "Python"],
        "android": ["Jetpack Compose", "Kotlin Coroutines", "Dagger Hilt", "Room"],
        "tools": ["Git", "Docker", "Firebase", "Android Studio"],
        "methodologies": ["Agile", "Scrum", "TDD", "CI/CD"]
    },
    "languages": [
        { "id": "1", "name": "FRENCH", "level": "NATIVE", "proficiency": 100 },
        { "id": "2", "name": "SPANISH", "level": "NATIVE", "proficiency": 100 },
        { "id": "3", "name": "ENGLISH", "level": "ADVANCED", "proficiency": 90 }
    ],
    "updated_at": new Date().toISOString()
};

const Storage = {
    COLLECTION: 'cv_data',
    DOC_ID: 'main',

    load: async () => {
        try {
            if (!db) throw new Error("Firebase not initialized");

            console.log('Loading data from Firestore...');
            const doc = await db.collection(Storage.COLLECTION).doc(Storage.DOC_ID).get();

            if (doc.exists) {
                console.log('Data loaded from Firestore');
                return doc.data();
            } else {
                console.log('No data found in Firestore, creating default...');
                await Storage.save(DEFAULT_DATA);
                return DEFAULT_DATA;
            }
        } catch (error) {
            console.warn('Error loading from Firestore (using fallback):', error);
            // Fallback to local storage or default if Firebase fails
            const local = localStorage.getItem('cv_data_backup');
            return local ? JSON.parse(local) : DEFAULT_DATA;
        }
    },

    save: async (data) => {
        data.updated_at = new Date().toISOString();
        try {
            if (db) {
                await db.collection(Storage.COLLECTION).doc(Storage.DOC_ID).set(data);
                console.log('Data saved to Firestore');
            }
            // Always backup to local storage
            localStorage.setItem('cv_data_backup', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error saving to cloud. Check console.');
        }
    },

    reset: async () => {
        await Storage.save(DEFAULT_DATA);
        return DEFAULT_DATA;
    },

    export: () => {
        const data = localStorage.getItem('cv_data_backup') || JSON.stringify(DEFAULT_DATA);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv_data_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
