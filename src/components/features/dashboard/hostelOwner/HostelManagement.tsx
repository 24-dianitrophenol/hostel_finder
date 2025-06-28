import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Loader, MapPin, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/supabase';
import type { Database } from '../../../../lib/database.types';

type Hotel = Database['public']['Tables']['hotels']['Row'] & {
  rooms?: Database['public']['Tables']['rooms']['Row'][];
};

const HostelManagement: React.FC = () => {
  const { profile } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      loadHotels();
    }
  }, [profile]);

  const loadHotels = async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      const data = await db.hotels.getByOwner(profile.id);
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHotel = () => {
    setIsAddingHotel(true);
    setSelectedHotel(null);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsAddingHotel(true);
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
      return;
    }

    try {
      await db.hotels.delete(hotelId);
      setHotels(hotels.filter(h => h.id !== hotelId));
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hostel. Please try again.');
    }
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const hotelData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      contact_number: formData.get('contact_number') as string,
      amenities: (formData.get('amenities') as string)
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0),
    };

    try {
      setIsSaving(true);
      
      if (selectedHotel) {
        // Update existing hotel
        const updatedHotel = await db.hotels.update(selectedHotel.id, hotelData);
        setHotels(hotels.map(h => h.id === selectedHotel.id ? updatedHotel : h));
      } else {
        // Create new hotel
        const newHotel = await db.hotels.create({
          ...hotelData,
          owner_id: profile.id,
        });
        setHotels([...hotels, newHotel]);
      }
      
      setIsAddingHotel(false);
      setSelectedHotel(null);
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Failed to save hostel. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-900" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hostel Management</h2>
        <button
          onClick={handleAddHotel}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Hostel
        </button>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hostels yet</h3>
          <p className="text-gray-500 mb-6">Create your first hostel to start managing accommodations</p>
          <button
            onClick={handleAddHotel}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Hostel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <motion.div
              key={hotel.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Building className="w-8 h-8 text-primary-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                      {hotel.address && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {hotel.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditHotel(hotel)}
                      className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {hotel.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Rooms: {hotel.rooms?.length || 0}</span>
                  </div>
                  {hotel.contact_number && (
                    <span>{hotel.contact_number}</span>
                  )}
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Hotel Modal */}
      <AnimatePresence>
        {isAddingHotel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold mb-4">
                {selectedHotel ? 'Edit Hostel' : 'Add New Hostel'}
              </h3>
              
              <form onSubmit={handleSaveHotel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostel Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={selectedHotel?.name}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter hostel name"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    defaultValue={selectedHotel?.address || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter address"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    name="contact_number"
                    type="tel"
                    defaultValue={selectedHotel?.contact_number || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter contact number"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={selectedHotel?.description || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your hostel"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities (comma-separated)
                  </label>
                  <input
                    name="amenities"
                    type="text"
                    defaultValue={selectedHotel?.amenities?.join(', ') || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="WiFi, Security, Laundry, etc."
                    disabled={isSaving}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingHotel(false);
                      setSelectedHotel(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {selectedHotel ? 'Save Changes' : 'Add Hostel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostelManagement;