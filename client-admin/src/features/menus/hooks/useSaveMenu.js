import { useMenuStore } from '../store/menuStore.js';

export const useSaveMenu = () => {
  const createMenu = useMenuStore((s) => s.createMenu);
  const updateMenu = useMenuStore((s) => s.updateMenu);

  const saveMenu = async (data, menuId = null) => {
    const formData = new FormData();
    const days = data['availability.days'] || [];
    const photoFile = data.photo?.[0];

    formData.append('name', data.name);
    if (data.price !== undefined) formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('available', data.available);

    if (data.description) formData.append('description', data.description);
    if (data.ingredients) formData.append('ingredients', data.ingredients);
    if (data.restaurantId) formData.append('restaurantId', data.restaurantId);

    if (Array.isArray(days)) {
      days.forEach((d) => formData.append('availability[days][]', d));
    } else if (days) {
      formData.append('availability[days][]', days);
    }
    if (photoFile instanceof File) formData.append('photo', photoFile);
    if (menuId) {
      await updateMenu(menuId, formData);
    } else {
      await createMenu(formData);
    }
    return true;
  };
  return { saveMenu };
};
