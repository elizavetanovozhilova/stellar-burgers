import { FC, SyntheticEvent, useState, useEffect } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRegisterUser,selectIsAuthenticated, selectErrorText, selectLoading } from '../../services/slices/mainSlice';
import { AppDispatch, RootState } from '../../services/store';
import { Preloader } from '@ui';



export const Register: FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const registerError = useSelector(selectErrorText);
  const isLoading = useSelector(selectLoading);
  

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setError(registerError || '');
  }, [registerError]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    
    if (!userName || !email || !password) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    dispatch(fetchRegisterUser({
      name: userName,
      email,
      password
    }));
  };

  if (isLoading) {
    return <div>Регистрация...</div>;
  }

  return (
    <RegisterUI
      errorText={error}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
