import Occasion from '../models/occasion.model.js';

export const getAllOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find();
    res.json(occasions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOccasionNames = async (req, res) => {
  try {
    const names = await Occasion.find().select('name -_id');
    res.json(names.map(n => n.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createOccasion = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Occasion.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Occasion already exists' });

    const occasion = new Occasion({ name, description });
    await occasion.save();
    res.status(201).json(occasion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    await Occasion.findByIdAndDelete(id);
    res.json({ message: 'Occasion deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
