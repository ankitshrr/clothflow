import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserAddress } from '../types';

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAddresses(data as UserAddress[]);
    }
    
    setLoading(false);
  };

  const addAddress = async (address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('User must be logged in') };

    // If this is the first address or set to default, we might need to unset others
    if (address.is_default && addresses.length > 0) {
      await unsetDefaults();
    } else if (addresses.length === 0) {
      address.is_default = true;
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert([
        { ...address, user_id: user.id }
      ])
      .select()
      .single();

    if (!error) {
      fetchAddresses();
    }
    
    return { data, error };
  };

  const updateAddress = async (id: string, updates: Partial<UserAddress>) => {
    if (!user) return { error: new Error('User must be logged in') };

    if (updates.is_default) {
      await unsetDefaults(id);
    }

    const { error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      fetchAddresses();
    }

    return { error };
  };

  const deleteAddress = async (id: string) => {
    if (!user) return { error: new Error('User must be logged in') };

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id));
    }

    return { error };
  };

  const unsetDefaults = async (excludeId?: string) => {
    if (!user) return;
    let query = supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    await query;
  };

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    refreshAddresses: fetchAddresses
  };
}
