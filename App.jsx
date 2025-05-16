import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "https://rateme-16a88-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const suggestedPlaces = {
    Salalah: [
        "https://i.pinimg.com/736x/76/32/b6/7632b6df3df54f64fd9a9f3f817d4796--salalah-oman.jpg",
        "https://beautifulsalalahtours.com/wp-content/uploads/2020/06/Wadi-Darbat-Salalah-Oman3-870x555.jpg",
        "https://images.myguide-cdn.com/oman/companies/salalah-east-full-day-sharing-tour-darbat-waterfall-samhan/large/salalah-east-full-day-sharing-tour-darbat-waterfall-samhan-1947324.jpg",
    ],
    Matrah: [
        "https://th.bing.com/th/id/OIP.GucCSR7kN0PxNvANqpk7kgHaFd",
        "https://i.pinimg.com/originals/93/8c/28/938c280cee6875cdb0ebe72387868492.jpg",
        "https://th.bing.com/th/id/R.48b6bcbc2738d83cd47dee17612f4286",
    ],
    "Jabal Al Akhdar": [
        "https://th.bing.com/th/id/OIP.14rMyoDIUf6024K0Amj4tgHaE8",
        "https://www.thearabianstories.com/wp-content/uploads/2022/03/AAJA-Rose-Tour_Image-2.jpg",
        "https://www.travoh.com/wp-content/uploads/2022/12/004-Anantara-Al-Jabal-Al-Akhdar-Resort-Oman-Aerial-View.jpg",
    ],
};

export default function App() {
    const [step, setStep] = useState("login");
    const [user, setUser] = useState("");
    const [place, setPlace] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const reviewsRef = ref(db, "reviews");
        onValue(reviewsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const loaded = Object.values(data);
            setReviews(loaded.sort((a, b) => b.timestamp - a.timestamp));
        });
    }, []);

    const handleLogin = () => {
        if (user.trim()) setStep("selectCountry");
    };

    const handleSubmitReview = async () => {
        if (!rating || !reviewText.trim()) return;

        const newReview = {
            user,
            rating,
            text: reviewText,
            place,
            timestamp: Date.now(),
        };

        try {
            const reviewsRef = ref(db, "reviews");
            await push(reviewsRef, newReview);
            setRating(0);
            setReviewText("");
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    const filteredReviews = reviews.filter((r) => r.place === place);

    return (
        <div className="p-6 max-w-5xl mx-auto min-h-screen bg-gradient-to-br from-lime-100 via-lime-200 to-lime-300 text-gray-800">
            <h1 className="text-5xl font-extrabold mb-10 text-center text-black tracking-wide drop-shadow-lg">
                RATEME
            </h1>

            {step === "login" && (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Login</h2>
                    <input
                        type="text"
                        placeholder="Enter your name or email"
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        className="border p-2 rounded w-80"
                    />
                    <br />
                    <button onClick={handleLogin} className="bg-lime-500 text-white px-4 py-2 rounded">
                        Login
                    </button>
                </div>
            )}

            {step === "selectCountry" && (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold">Where are you from?</h2>
                    <button onClick={() => setStep("suggested")} className="bg-lime-600 text-white px-4 py-2 rounded">
                        Oman
                    </button>
                </div>
            )}

            {step === "suggested" && (
                <div className="grid sm:grid-cols-3 gap-6 mt-6">
                    {Object.entries(suggestedPlaces).map(([placeName, images]) => (
                        <div
                            key={placeName}
                            onClick={() => {
                                setPlace(placeName);
                                setSubmitted(false);
                                setStep("showPhotos");
                            }}
                            className="cursor-pointer bg-white rounded shadow hover:shadow-xl transition-all"
                        >
                            <img
                                src={images[0]}
                                alt={placeName}
                                loading="lazy"
                                className="rounded-t w-full h-40 object-cover"
                            />
                            <div className="p-4 text-center font-medium">{placeName}</div>
                        </div>
                    ))}
                </div>
            )}

            {step === "showPhotos" && place && (
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold">{place}</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {suggestedPlaces[place].map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt={`${place}-${i}`}
                                loading="lazy"
                                className="rounded shadow"
                            />
                        ))}
                    </div>
                    <button onClick={() => setStep("review")} className="bg-lime-600 text-white px-4 py-2 rounded">
                        Rate & Review
                    </button>
                </div>
            )}

            {step === "review" && place && (
                <div className="space-y-6 mt-8">
                    <h2 className="text-2xl font-semibold text-center">Leave a Review for {place}</h2>

                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <Star
                                key={num}
                                className={`w-8 h-8 cursor-pointer ${
                                    num <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
                                }`}
                                onMouseEnter={() => setHoverRating(num)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(num)}
                                fill={num <= (hoverRating || rating) ? "#facc15" : "none"}
                            />
                        ))}
                    </div>

                    <textarea
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full max-w-xl mx-auto p-2 border rounded"
                    />

                    <div className="text-center">
                        <button onClick={handleSubmitReview} className="bg-lime-600 text-white px-6 py-2 rounded">
                            Submit Review
                        </button>
                        {submitted && <p className="text-green-600 mt-2">Thanks for your feedback!</p>}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-bold">Recent Reviews</h3>
                        <div className="space-y-4 mt-4">
                            {filteredReviews.map((r, idx) => (
                                <div key={idx} className="bg-white rounded p-4 shadow">
                                    <p className="font-semibold">{r.user}</p>
                                    <p>{"★".repeat(r.rating)}</p>
                                    <p>{r.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
