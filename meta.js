import mongoose from "mongoose";

const metaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    concluido: { type: Boolean, default: false },
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    }
});

export default mongoose.model('Meta', metaSchema);