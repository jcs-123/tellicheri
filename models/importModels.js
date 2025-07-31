import mongoose from 'mongoose';

const defaultSchema = new mongoose.Schema({}, { strict: false });

export const Parishes = mongoose.model('Parishes', defaultSchema);
export const PriestStatus = mongoose.model('PriestStatus', defaultSchema);
export const PriestSubStatus = mongoose.model('PriestSubStatus', defaultSchema);
export const PriestSecondarySubStatus = mongoose.model('PriistSecondarySubStatus', defaultSchema);
export const Priests = mongoose.model('Priests', defaultSchema);
export const PriestHistories = mongoose.model('PriestHistories', defaultSchema);
export const PriestEducations = mongoose.model('PriistEducations', defaultSchema);
export const PriestOthers = mongoose.model('PriestOthers', defaultSchema);
export const Administration = mongoose.model('Administration', defaultSchema);
export const Institutions = mongoose.model('Institutions', defaultSchema);
export const PriestDesignations = mongoose.model('PriestDesignations', defaultSchema);
