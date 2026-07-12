import { useRestaurantStore } from '../store/restaurantStore';

export const useSaveRestaurant = () => {
  const createRestaurant = useRestaurantStore((state) => state.createRestaurant);
  const updateRestaurant = useRestaurantStore((state) => state.updateRestaurant);
  const uploadPhoto = useRestaurantStore((state) => state.uploadPhoto);

  const saveRestaurant = async (formData, restaurantId = null) => {
    try {
      if (restaurantId) {
        const payload = {
          name: formData.get('name'),
          capacity: Number(formData.get('capacity')),
          address: formData.get('address'),
          phone: formData.get('phone'),
          category: formData.get('category'),
          businessHours: {
            open: formData.get('businessHoursOpen'),
            close: formData.get('businessHoursClose'),
          },
          contactInfo: {
            managerName: formData.get('managerName') || undefined,
            email: formData.get('contactEmail') || undefined,
          },
        };
        await updateRestaurant(restaurantId, payload);

        // El PATCH de arriba envía JSON y no procesa archivos, así que la foto
        // (si se seleccionó una nueva) se sube aparte con el endpoint dedicado.
        const photo = formData.get('photo');
        if (photo) {
          const photoFormData = new FormData();
          photoFormData.append('photo', photo);
          await uploadPhoto(restaurantId, photoFormData);
        }
      } else {
        await createRestaurant(formData);
      }
      return true;
    } catch {
      return false;
    }
  };

  return { saveRestaurant };
};