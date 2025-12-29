import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Incorrect login details');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
        {/* Background Blobs */}
        <div className="login-blob blob-1"></div>
        <div className="login-blob blob-2"></div>

        <div className="glass-panel login-card">
            <div className="login-header">
                <h1>Admin Portal</h1>
                <p>Sign in to access user management</p>
            </div>

            {error && (
                <div className="error-message">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            required
                            className="input-field"
                            style={{ paddingLeft: '3.5rem' }}
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            required
                            className="input-field"
                            style={{ paddingLeft: '3.5rem' }}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>
            
            <div className="login-footer">
                 <p>Protected System • Authorized Access Only</p>
                 <p style={{ marginTop: '0.5rem' }}>Mock Credentials: admin@bank.com / password123</p>
            </div>
        </div>
    </div>
  );
};

export default Login;
