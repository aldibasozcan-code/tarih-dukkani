import { useState } from "react";
import { loginUser, registerUser } from "../lib/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                await loginUser(email, password);
                setMessage("Giriş başarılı");
            } else {
                await registerUser(email, password);
                setMessage("Kayıt başarılı");
            }
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div style={{ padding: "40px" }}>
            <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <br /><br />

                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br /><br />

                <button type="submit">
                    {isLogin ? "Giriş Yap" : "Kayıt Ol"}
                </button>
            </form>

            <br />

            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Hesabın yok mu? Kayıt ol" : "Zaten hesabın var mı? Giriş yap"}
            </button>

            <p>{message}</p>
        </div>
    );
}