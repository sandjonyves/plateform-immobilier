import { create } from 'zustand';
import {
  deleteDocumentApi,
  fetchDocuments,
  uploadDocumentApi,
  type DocumentDto,
} from '../../infrastructure/api/resources';

interface DocumentStore {
  documents: DocumentDto[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  uploader: (input: {
    nom: string;
    type: string;
    fichier: File;
    bien_associe?: string;
  }) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const documents = await fetchDocuments();
      set({ documents, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  uploader: async (input) => {
    await uploadDocumentApi(input);
    await get().charger();
  },
  supprimer: async (id) => {
    await deleteDocumentApi(id);
    await get().charger();
  },
}));
