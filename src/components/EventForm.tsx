import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Upload, X, AlertCircle } from 'lucide-react';
import { EventType } from '../types';
import { eventTypeLabels } from '../data/mockData';
import { provinces } from '../data/provinces';
import { supabase } from '../lib/supabaseClient';

interface MultimediaItem {
  id: string;
  url: string;
  type: string;
}

interface EventFormProps {
  onSubmit: (eventData: any) => void;
  currentUser: any;
  initialData?: any;
  isEditing?: boolean;
}

export function EventForm({ onSubmit, currentUser, initialData, isEditing = false }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: (initialData?.type || 'peña') as EventType,
    province: initialData?.province || '',
    city: initialData?.city || '',
    locality: '',
    address: initialData?.address || '',
    date: initialData?.date ? initialData.date.split('T')[0] : '',
    time: initialData?.date ? initialData.date.split('T')[1]?.substring(0,5) : '',
    isFree: initialData?.is_free || false,
    priceAnticipada: initialData?.price_anticipada?.toString() || '',
    priceGeneral: initialData?.price_general?.toString() || '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previewMultimedia, setPreviewMultimedia] = useState<MultimediaItem[]>(initialData?.multimedia || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for loading preview image
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadMessage, setImageLoadMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  if (selectedFiles.length > 1) {
    setErrors(prev => ({ ...prev, files: 'Solo se permite un archivo' }));
    return;
  }

  const file = selectedFiles[0];
  if (!file) {
    setFiles([]);
    setPreviewMultimedia([]);
    setImageLoadMessage('');
    setIsImageLoading(false);
    return;
  }

  const isValidSize = file.size <= 8 * 1024 * 1024; // máximo 8MB (mejor para celular)
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = ext && allowedExtensions.includes(ext);
  const isValidMime = file.type.startsWith('image/');

  if (!(isValidSize && (isValidMime || isValidExtension))) {
    setErrors(prev => ({ ...prev, files: 'El archivo no es válido. Máx 8MB, formato imagen' }));
    setFiles([]);
    setIsImageLoading(false);
    setImageLoadMessage('');
    return;
  }

  try {
    const objectUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      setIsImageLoading(true);
      setImageLoadMessage('Cargando archivo...');
      setFiles([file]);
      setPreviewMultimedia([]); // limpiar anterior
      setErrors(prev => ({ ...prev, files: '' }));

      setTimeout(() => {
        setIsImageLoading(false);
        setImageLoadMessage('Imagen lista para publicar.');
      }, 4000);
    };
    img.onerror = () => {
      setErrors(prev => ({ ...prev, files: 'No se pudo generar vista previa. Probá con otra imagen.' }));
      setFiles([]);
      setIsImageLoading(false);
      setImageLoadMessage('');
    };
    img.src = objectUrl;
  } catch (err) {
    console.error('Error generando preview:', err);
    setErrors(prev => ({ ...prev, files: 'Error procesando la imagen. Probá con otra.' }));
    setFiles([]);
    setIsImageLoading(false);
    setImageLoadMessage('');
  }
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

  if (!isEditing && files.length === 0 && previewMultimedia.length === 0) {
    newErrors.files = 'Al menos una imagen es obligatoria';
  }

  const eventDateTime = new Date(`${formData.date}T${formData.time}`);
  if (eventDateTime <= new Date()) {
    newErrors.date = 'La fecha y hora deben ser futuras';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const uploadNewImage = async () => {
  const file = files[0];
  const filePath = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('event-files').upload(filePath, file);

  if (error) throw new Error('Error al subir imagen');

  const { data } = supabase.storage.from('event-files').getPublicUrl(filePath);
  return [{ id: filePath, type: 'image', url: data.publicUrl }];
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let multimedia = previewMultimedia;

      if (files.length > 0) {
        if (previewMultimedia[0]?.id) {
          await supabase.storage.from('event-files').remove([previewMultimedia[0].id]);
        }
        multimedia = await uploadNewImage();
      }

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
        ...(isEditing && { id: initialData?.id }),
      };

      onSubmit(eventData);

      if (!isEditing) {
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
        setPreviewMultimedia([]);
        setIsImageLoading(false);
        setImageLoadMessage('');
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al guardar el evento' });
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
            placeholder="Indicar ciudad"
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
          placeholder="Breve descripcion del evento" 
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="w-full border rounded-lg px-4 py-2 mt-1"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Foto del evento *</label>
        <input type="file" accept="image/*,.heic,.heif" onChange={handleFileChange} className="mt-1" />
        {errors.files && <p className="text-red-600 text-sm mt-1">{errors.files}</p>}
        <div className="mt-2 flex gap-4 flex-wrap items-center">
          {/* Preview existing images */}
          {previewMultimedia.map((item, idx) => (
            <div key={idx} className="relative w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
              <img src={item.url} alt="preview" className="object-cover w-full h-full" />
            </div>
          ))}

          {/* Preview new selected files */}
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative w-32 h-32 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center"
            >
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className={`object-cover w-full h-full transition-all duration-500 ${
                  isImageLoading ? 'blur-sm' : 'blur-0'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  setIsImageLoading(false);
                  setImageLoadMessage('');
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <X size={16} />
              </button>
              {/* Overlay message on the image */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-sm font-semibold">
                  {imageLoadMessage}
                </div>
              )}
            </div>
          ))}

          {/* If loading and no files selected yet */}
          {isImageLoading && files.length === 0 && (
            <p className="text-gray-600 text-sm ml-2">{imageLoadMessage}</p>
          )}
        </div>
      </div>

      {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || isImageLoading}
          className={`bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (isEditing ? 'Actualizando...' : 'Publicando...') : isEditing ? 'Actualizar evento' : 'Publicar evento'}
        </button>
      </div>
    </form>
  );
}
