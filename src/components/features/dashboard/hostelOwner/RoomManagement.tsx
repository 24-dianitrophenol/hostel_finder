import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Bed, Loader, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/supabase';
import type { Database } from '../../../../lib/database.types';

type Hotel = Database['public']['Tables']['hotels']['Row'];
type Room = Database['public']['Tables']['rooms']['Row'];

const RoomManagement: React.FC = () => {
  const { profile } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      loadHotels();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedHotelId) {
      loadRooms();
    }
  }, [selectedHotelId]);

  const loadHotels = async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      const data = await db.hotels.getByOwner(profile.id);
      setHotels(data);
      if (data.length > 0 && !selectedHotelId) {
        setSelectedHotelId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRooms = async () => {
    if (!selectedHotelId) return;
    
    try {
      const data = await db.rooms.getByHotel(selectedHotelId);
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleAddRoom = () => {
    setIsAddingRoom(true);
    setSelectedRoom(null);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsAddingRoom(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await db.rooms.delete(roomId);
      setRooms(rooms.filter(r => r.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room. Please try again.');
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelId) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const roomData = {
      hotel_id: selectedHotelId,
      room_number: formData.get('room_number') as string,
      type: formData.get('type') as string,
      price: parseFloat(formData.get('price') as string),
      floor_number: parseInt(formData.get('floor_number') as string) || null,
      room_category: formData.get('room_category') as string || null,
      description: formData.get('description') as string || null,
      amenities: (formData.get('amenities') as string)
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0),
    };

    try {
      setIsSaving(true);
      
      if (selectedRoom) {
        // Update existing room
        const updatedRoom = await db.rooms.update(selectedRoom.id, roomData);
        setRooms(rooms.map(r => r.id === selectedRoom.id ? updatedRoom : r));
      } else {
        // Create new room
        const newRoom = await db.rooms.create(roomData);
        setRooms([...rooms, newRoom]);
      }
      
      setIsAddingRoom(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-900" />
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Bed className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hostels found</h3>
          <p className="text-gray-500">You need to create a hostel first before adding rooms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Room Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedHotelId}
            onChange={e => setSelectedHotelId(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {hotels.map(hotel => (
              <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddRoom}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <Bed className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-500 mb-6">Add your first room to start managing accommodations</p>
          <button
            onClick={handleAddRoom}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Bed className="w-8 h-8 text-primary-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Room {room.room_number}</h3>
                      <p className="text-sm text-gray-500">{room.type}</p>
                      {room.floor_number && (
                        <p className="text-xs text-gray-400">Floor {room.floor_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="flex items-center text-primary-900 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatPrice(room.price)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </div>

                  {room.room_category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{room.room_category}</span>
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-gray-700 text-sm mt-4 line-clamp-2">{room.description}</p>
                )}

                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{room.amenities.length - 3} more
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

      {/* Add/Edit Room Modal */}
      <AnimatePresence>
        {isAddingRoom && (
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
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4">
                {selectedRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              
              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number
                    </label>
                    <input
                      name="room_number"
                      type="text"
                      defaultValue={selectedRoom?.room_number}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="101"
                      required
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Number
                    </label>
                    <input
                      name="floor_number"
                      type="number"
                      defaultValue={selectedRoom?.floor_number || ''}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="1"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    name="type"
                    defaultValue={selectedRoom?.type}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={isSaving}
                  >
                    <option value="">Select type</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Single Deluxe">Single Deluxe</option>
                    <option value="Double Deluxe">Double Deluxe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Category
                  </label>
                  <input
                    name="room_category"
                    type="text"
                    defaultValue={selectedRoom?.room_category || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Standard, Premium, etc."
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (UGX)
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="1000"
                    defaultValue={selectedRoom?.price}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="450000"
                    required
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
                    defaultValue={selectedRoom?.description || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe the room features"
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
                    defaultValue={selectedRoom?.amenities?.join(', ') || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Bed, Desk, Wardrobe, Private Bathroom"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingRoom(false);
                      setSelectedRoom(null);
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
                    {selectedRoom ? 'Save Changes' : 'Add Room'}
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

export default RoomManagement;