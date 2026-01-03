import { useState } from 'react';
import { X, Edit2, Save, Mail, Briefcase, Phone, Camera } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import imgGabrielProfile from "../../assets/GabrielRivero.jpg";

interface ProfilePanelProps {
  onClose: () => void;
}

export function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { isDark } = useTheme();
  const { currentUser } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const defaultAvatar = currentUser ? `https://ui-avatars.com/api/?name=${encodeURIComponent(`${currentUser.firstName} ${currentUser.lastName}`)}&background=random&color=fff` : imgGabrielProfile;
  const [profileImage, setProfileImage] = useState<string>(currentUser?.avatar || defaultAvatar);

  // Datos del perfil
  const [profileData, setProfileData] = useState({
    nombre: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario',
    email: currentUser?.email || '',
    rol: currentUser?.metadata?.position || '',
    departamento: 'Comercial', // Esto podría venir de las áreas asignadas si se implementa lógica
    telefono: '', // No tenemos teléfono en el modelo de usuario actual, dejamos vacío o mock
  });

  const handleSave = () => {
    setIsEditing(false);
    // Aquí se podría agregar lógica para guardar en una API o contexto
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetear a los valores originales si es necesario
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 h-full w-[340px] z-50 shadow-2xl transform transition-transform duration-300 ${isDark ? 'bg-[#141414] border-l border-gray-800' : 'bg-white border-l border-gray-200'
          }`}
      >
        {/* Header */}
        <div className={`border-b px-6 py-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mi Perfil
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={isDark ? 'text-gray-400 hover:text-white hover:bg-[#1e1e1e]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-6">
          {/* Avatar y nombre */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <Avatar className="h-24 w-24 ring-4 ring-[#fb2c36]/20">
                <img src={profileImage} alt="Usuario" className="object-cover" />
                <AvatarFallback className="bg-[#fb2c36] text-white text-xl">
                  {currentUser ? `${currentUser.firstName[0]}${currentUser.lastName[0]}` : 'US'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                </>
              )}
            </div>
            <h3 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profileData.nombre}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {profileData.rol}
            </p>
          </div>

          {/* Información del perfil */}
          <div className="space-y-5 mb-8">
            {/* Email */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              {isEditing ? (
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : 'bg-white border-gray-300'}
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {profileData.email}
                </p>
              )}
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                <Briefcase className="h-4 w-4" />
                Departamento
              </Label>
              {isEditing ? (
                <Input
                  value={profileData.departamento}
                  onChange={(e) => setProfileData({ ...profileData, departamento: e.target.value })}
                  className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : 'bg-white border-gray-300'}
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {profileData.departamento}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              {isEditing ? (
                <Input
                  value={profileData.telefono}
                  onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                  className={isDark ? 'bg-[#1e1e1e] border-gray-800 text-white' : 'bg-white border-gray-300'}
                />
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  {profileData.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Botones CTA */}
          <div className="mt-auto">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#fb2c36] hover:bg-[#e02531] text-white"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#fb2c36] hover:bg-[#e02531] text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className={`flex-1 ${isDark ? 'border-gray-700 text-gray-400 hover:bg-[#1e1e1e]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}