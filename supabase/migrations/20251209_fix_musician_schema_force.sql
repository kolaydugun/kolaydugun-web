-- Force update form_schema for 'Müzik Grupları' and aliases
-- This ensures the schema matches our 'dictionary.js' keys exactly.

UPDATE public.categories
SET form_schema = '[
  {
    "key": "music_instruments",
    "label": "enstrumanlar_label",
    "type": "multiselect",
    "options": [
      "instr_davul_zurna",
      "instr_solist",
      "instr_bendir",
      "instr_darbuka",
      "instr_baglama",
      "instr_ud",
      "instr_kanun",
      "instr_cumbus",
      "instr_tanbur",
      "instr_ney",
      "instr_mey",
      "instr_kaval",
      "instr_sipsi",
      "instr_keyboard",
      "instr_orkestra",
      "instr_dj",
      "instr_quartet",
      "instr_trio",
      "instr_bando"
    ]
  },
  {
    "key": "music_genres",
    "label": "music_genres_label",
    "type": "multiselect",
    "options": [
      "genre_pop",
      "genre_turkish_pop",
      "genre_halay",
      "genre_arabesque",
      "genre_classical",
      "genre_jazz",
      "genre_rock",
      "genre_folk"
    ]
  }
]'::jsonb
WHERE name = 'Müzik Grupları' OR name = 'Musicians' OR name = 'Music Groups' OR name = 'Band / DJ';
