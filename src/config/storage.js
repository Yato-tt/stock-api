const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

let storage;

if (isProduction && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  storage = {
    async upload(file, folder) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },

    async delete(filePath) {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) throw error;
    }
  };

  console.log('☁️ Usando Supabase Storage');

} else {
  storage = {
    async upload(file, folder) {
      return file.path;
    },

    async delete(filePath) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  };

  console.log('📁 Usando sistema de arquivos local');
}

module.exports = storage;
