import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Upload, X, AlertCircle } from 'lucide-react';
import { EventType } from '../types';
import { provinces, eventTypeLabels } from '../data/mockData';

interface EventFormProps {
  onSubmit: (eventData: any) => void;
  currentUser: any;
}

export function EventForm({ onSubmit, currentUser }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'peña' as EventType,
    province: '',
    city: '',
    address: '',
    date: '',
    time: '',
    price: '',
    isFree: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProvinceData = provinces.find(p => p.name === formData.province);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset city when province changes
    if (name === 'province') {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 2) {
      setErrors(prev => ({ ...prev, files: 'Máximo 2 archivos permitidos' }));
      return;
    }

    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setErrors(prev => ({ ...prev, files: 'Solo se permiten imágenes y videos (máx. 20MB cada uno)' }));
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.province) newErrors.province = 'La provincia es obligatoria';
    if (!formData.city) newErrors.city = 'La ciudad es obligatoria';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.time) newErrors.time = 'La hora es obligatoria';
    if (!formData.isFree && !formData.price) newErrors.price = 'El precio es obligatorio si no es gratis';
    if (files.length === 0) newErrors.files = 'Al menos una imagen o video es obligatoria';

    // Validate date is in the future
    if (formData.date && formData.time) {
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      if (eventDateTime <= new Date()) {
        newErrors.date = 'La fecha y hora deben ser futuras';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const eventData = {
        ...formData,
        price: formData.isFree ? 'free' : parseInt(formData.price),
        date: new Date(`${formData.date}T${formData.time}`),
        files
      };

      onSubmit(eventData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'peña' as EventType,
        province: '',
        city: '',
        address: '',
        date: '',
        time: '',
        price: '',
        isFree: false,
      });
      setFiles([]);
      
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al publicar el evento. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-neutral-800">Publicar Evento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Título del evento *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
              errors.title ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Ej: Peña de los Chalchaleros"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de evento *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
          >
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Provincia *
            </label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                errors.province ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              <option value="">Seleccionar provincia</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.province}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Ciudad *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!formData.province}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
                errors.city ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              <option value="">Seleccionar ciudad</option>
              {selectedProvinceData?.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.city}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Dirección exacta *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
              errors.address ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Ej: Av. Belgrano 1234, Centro"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.address}
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                errors.date ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Hora *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                errors.time ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.time}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Precio
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleInputChange}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-neutral-700">Evento gratuito</span>
            </label>
            
            {!formData.isFree && (
              <div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${
                    errors.price ? 'border-red-500' : 'border-neutral-300'
                  }`}
                  placeholder="Precio en pesos argentinos"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 resize-none ${
              errors.description ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Describe tu evento, qué incluye, qué pueden esperar los asistentes..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Fotos o videos (máx. 2 archivos) *
          </label>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors duration-200">
            <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer"
            >
              Seleccionar archivos
            </label>
          </div>
          
          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-neutral-700">{file.name}</span>
                    <span className="text-xs text-neutral-500">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {errors.files && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.files}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          {errors.submit && (
            <p className="mb-4 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.submit}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Publicando evento...</span>
              </div>
            ) : (
              'Publicar Evento'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}