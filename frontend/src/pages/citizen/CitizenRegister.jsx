/**
 * SUVIDHA 2026 - Citizen Register Page
 * 
 * This is a redirect to CitizenLogin (registration is part of login flow)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const CitizenRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login (registration is handled in login page)
    navigate(ROUTES.CITIZEN_LOGIN);
  }, [navigate]);

  return null;
};

export default CitizenRegister;
