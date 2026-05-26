import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { StoreLocation } from '../types';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';

export default function StoresPage() {
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data } = await supabase
      .from('store_locations')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setStores(data);
      if (data.length > 0) {
        setSelectedStore(data[0]);
      }
    }
    setLoading(false);
  };

  const openInGoogleMaps = (store: StoreLocation) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`,
      '_blank'
    );
  };

  const getDirections = (store: StoreLocation) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Store</h1>
          <p className="text-gray-600 dark:text-gray-300">Visit us in Kathmandu, Nepal</p>
        </div>

        {selectedStore && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedStore.name}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedStore.address}</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedStore.city}, {selectedStore.state} {selectedStore.postal_code}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{selectedStore.country}</p>
                  </div>
                </div>

                {selectedStore.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {selectedStore.phone}
                    </a>
                  </div>
                )}

                {selectedStore.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <a
                      href={`mailto:${selectedStore.email}`}
                      className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {selectedStore.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
                  <Clock className="w-5 h-5" />
                  <span>Operating Hours</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedStore.operating_hours &&
                    Object.entries(selectedStore.operating_hours as Record<string, string>).map(
                      ([day, hours]) => (
                        <div key={day} className="text-sm">
                          <span className="capitalize text-gray-600 dark:text-gray-300">{day}: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{hours}</span>
                        </div>
                      )
                    )}
                </div>
              </div>

              {selectedStore.offers_pickup && (
                <div className="mb-6 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pickup Available
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => getDirections(selectedStore)} className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openInGoogleMaps(selectedStore)}
                  className="flex-1 dark:border-white dark:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-[500px] bg-gray-100 dark:bg-gray-700">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedStore.latitude},${selectedStore.longitude}&zoom=16`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={selectedStore.name}
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>
        )}

        {stores.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No store locations found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Check back soon for store updates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
