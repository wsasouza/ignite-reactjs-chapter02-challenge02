import { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface FoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard = () => {
  const [foods, setFoods] = useState<FoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<FoodPlate>({} as FoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const foodList = await api.get('/foods');

      setFoods(foodList.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<FoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFood = {
        id: foods[foods.length - 1] ? foods[foods.length - 1].id + 1 : 1,
        name: food.name,
        description: food.description,
        price: food.price,
        available: true,
        image: food.image,
      };

      await api.post('/foods', newFood);
      setFoods([...foods, newFood]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<FoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const newFoodList = foods.map(currentFood => {
      if (currentFood.id !== editingFood.id) {
        return currentFood;
      }
      return {
        ...food,
        id: editingFood.id,
        available: editingFood.available,
      };
    });
    setFoods(newFoodList);
    await api.put(`/foods/${editingFood.id}`, {
      ...food,
      id: editingFood.id,
      available: editingFood.available,
    });
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    const newFoodList = foods.filter(currentFood => currentFood.id !== id);
    setFoods(newFoodList);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;