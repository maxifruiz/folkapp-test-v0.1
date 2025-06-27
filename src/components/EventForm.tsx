import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Upload, X, AlertCircle } from 'lucide-react';
import { EventType } from '../types';
import { eventTypeLabels } from '../data/mockData';
import { provinces } from '../data/provinces';
import { supabase } from '../lib/supabaseClient';

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
    locality: '',
    address: '',
    date: '',
    time: '',
    isFree: false,
    priceAnticipada: '',
    priceGeneral: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 2) {
      setErrors(prev => ({ ...prev, files: 'Máximo 2 archivos permitidos' }));
      return;
    }
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 20 * 1024 * 1024;
      return isValidType && isValidSize;
    });
    if (validFiles.length !== selectedFiles.length) {
      setErrors(prev => ({ ...prev, files: 'Solo se permiten imágenes y videos (máx. 20MB)' }));
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
    if (!formData.isFree && (!formData.priceAnticipada || !formData.priceGeneral)) {
      newErrors.priceAnticipada = 'Obligatorio';
      newErrors.priceGeneral = 'Obligatorio';
    }
    if (files.length === 0) newErrors.files = 'Al menos una imagen o video es obligatoria';

    const eventDateTime = new Date(`${formData.date}T${formData.time}`);
    if (eventDateTime <= new Date()) {
      newErrors.date = 'La fecha y hora deben ser futuras';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFilesToSupabase = async () => {
    const uploaded = [];
    for (const file of files) {
      const filePath = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('event-files').upload(filePath, file);
      if (error) throw new Error('Error al subir archivos');
      const { data } = supabase.storage.from('event-files').getPublicUrl(filePath);
      uploaded.push({
        id: filePath,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: data.publicUrl,
      });
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const multimedia = await uploadFilesToSupabase();

      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        province: formData.province,
        city: formData.city,
        address: formData.address,
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        is_free: formData.isFree,
        price_anticipada: formData.isFree ? null : parseFloat(formData.priceAnticipada),
        price_general: formData.isFree ? null : parseFloat(formData.priceGeneral),
        multimedia,
        organizer_id: currentUser.id,
        organizer: {
          full_name: currentUser.user_metadata?.full_name || 'Organizador',
          avatar: currentUser.user_metadata?.avatar_url || '',
        },
      };

      onSubmit(eventData);

      setFormData({
        title: '',
        description: '',
        type: 'peña',
        province: '',
        city: '',
        locality: '',
        address: '',
        date: '',
        time: '',
        isFree: false,
        priceAnticipada: '',
        priceGeneral: '',
      });
      setFiles([]);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al publicar el evento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl shadow-md max-w-2xl mx-auto bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Título del evento *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ej: Peña de los Chalchaleros"
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de evento *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          >
            {Object.entries(eventTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Provincia *</label>
          <select
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          >
            <option value="">Seleccionar provincia</option>
            {provinces.map(p => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.province && <p className="text-red-600 text-sm mt-1">{errors.province}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Ciudad *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Seleccionar ciudad"
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
          {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Dirección exacta *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Ej: Av. Belgrano 1234, Centro"
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
          {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Fecha *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
          {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Hora *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />
          {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Precio</label>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleInputChange} />
          <span>Evento gratuito</span>
        </div>
        {!formData.isFree && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <input
              type="number"
              name="priceAnticipada"
              value={formData.priceAnticipada}
              onChange={handleInputChange}
              placeholder="Precio anticipada ($)"
              className="w-full border rounded-lg px-4 py-2"
            />
            <input
              type="number"
              name="priceGeneral"
              value={formData.priceGeneral}
              onChange={handleInputChange}
              placeholder="Precio general ($)"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        )}
        {errors.priceAnticipada && <p className="text-red-600 text-sm mt-1">{errors.priceAnticipada}</p>}
        {errors.priceGeneral && <p className="text-red-600 text-sm mt-1">{errors.priceGeneral}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="w-full border rounded-lg px-4 py-2 mt-1"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Fotos/Videos *</label>
        <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="mt-1" />
        {errors.files && <p className="text-red-600 text-sm mt-1">{errors.files}</p>}
        <div className="mt-2 flex gap-4 flex-wrap">
          {files.map((file, idx) => (
            <div key={idx} className="relative w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
              {file.type.startsWith('image') ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
              ) : (
                <video src={URL.createObjectURL(file)} controls className="object-cover w-full h-full" />
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar evento'}
        </button>
      </div>
    </form>
  );
}
