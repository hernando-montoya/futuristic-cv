// Firebase Configuration (OPTIONAL - leave empty to use localStorage only)
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase only if config is provided
let db = null;
const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (hasFirebaseConfig) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.warn("Firebase initialization failed, using localStorage only:", e);
    }
} else {
    console.log("No Firebase config - using localStorage only mode");
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
    STORAGE_KEY: 'cv_data_v1',

    load: async () => {
        // Try localStorage first
        const localData = localStorage.getItem(Storage.STORAGE_KEY);
        if (localData && localData !== "undefined" && localData !== "null") {
            try {
                console.log('Loaded data from localStorage');
                return JSON.parse(localData);
            } catch (e) {
                console.error('Corrupted localStorage data:', e);
                localStorage.removeItem(Storage.STORAGE_KEY);
            }
        }

        // Try Firestore if configured
        if (db) {
            try {
                console.log('Loading data from Firestore...');
                const doc = await db.collection(Storage.COLLECTION).doc(Storage.DOC_ID).get();

                if (doc.exists) {
                    const data = doc.data();
                    console.log('Data loaded from Firestore');
                    localStorage.setItem(Storage.STORAGE_KEY, JSON.stringify(data));
                    return data;
                }
            } catch (error) {
                console.warn('Error loading from Firestore:', error);
            }
        }

        // Fallback to default data
        console.log('Using default data');
        localStorage.setItem(Storage.STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
    },

    save: async (data) => {
        data.updated_at = new Date().toISOString();

        // Always save to localStorage
        localStorage.setItem(Storage.STORAGE_KEY, JSON.stringify(data));
        console.log('Data saved to localStorage');

        // Also save to Firestore if configured
        if (db) {
            try {
                await db.collection(Storage.COLLECTION).doc(Storage.DOC_ID).set(data);
                console.log('Data also saved to Firestore');
            } catch (error) {
                console.warn('Error saving to Firestore (data is safe in localStorage):', error);
            }
        }
    },

    reset: async () => {
        await Storage.save(DEFAULT_DATA);
        return DEFAULT_DATA;
    },

    export: () => {
        const data = localStorage.getItem(Storage.STORAGE_KEY) || JSON.stringify(DEFAULT_DATA);
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
