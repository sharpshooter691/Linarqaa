import React from "react";
import { useTranslation } from "react-i18next";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, subtitle }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">
          This page is under development - Coming soon!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage; 