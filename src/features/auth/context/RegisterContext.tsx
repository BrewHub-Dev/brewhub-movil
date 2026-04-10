import React, { createContext, useContext, useState, useMemo } from 'react';

interface RegisterFormData {
  name: string;
  emailAddress: string;
  password: string;
  inviteCode?: string;
}

interface RegisterContextType {
  formData: RegisterFormData;
  setFormData: (data: Partial<RegisterFormData>) => void;
  clearFormData: () => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export const RegisterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormDataState] = useState<RegisterFormData>({
    name: '',
    emailAddress: '',
    password: '',
    inviteCode: '',
  });

  const setFormData = (data: Partial<RegisterFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  const clearFormData = () => {
    setFormDataState({
      name: '',
      emailAddress: '',
      password: '',
      inviteCode: '',
    });
  };

  const value = useMemo(
    () => ({ formData, setFormData, clearFormData }),
    [formData]
  );

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterForm = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegisterForm must be used within RegisterProvider');
  }
  return context;
};
