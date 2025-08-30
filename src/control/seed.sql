BEGIN TRANSACTION;

/* ======================
   A) Single Tests (سطر واحد)
   ====================== */
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version)
VALUES
('FBS','single','Fasting Blood Sugar','سكر صائم','Serum','mg/dL','70-110','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('RBS','single','Random Blood Sugar','سكر عشوائي','Serum','mg/dL','—','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('HBA1C','single','HbA1c','الهيموكلوبين السكري','Whole Blood','%','<5.7 Normal','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('UREA','single','Urea','اليوريا','Serum','mg/dL','15-45','{"print":{"layout":"single-line"}}',6000,'v1.0.0'),

-- Creatinine مفصلة حسب الجنس
('CREAT','single','Creatinine','الكرياتنين','Serum','mg/dL',
'[{"sex":"M","low":0.7,"high":1.3,"unit":"mg/dL"},{"sex":"F","low":0.6,"high":1.1,"unit":"mg/dL"}]',
'{"print":{"layout":"single-line"}}',6000,'v1.0.1'),

('URIC','single','Uric Acid','حامض اليوريك','Serum','mg/dL','3.5-7.2 M / 2.6-6.0 F','{"print":{"layout":"single-line"}}',7000,'v1.0.0'),
('ESR','single','ESR','سرعة الترسيب','Whole Blood','mm/hr','0-15 M / 0-20 F','{"print":{"layout":"single-line"}}',4000,'v1.0.0'),
('CRP','single','C-Reactive Protein','بروتين سي التفاعلي','Serum','mg/L','<6','{"print":{"layout":"single-line"}}',8000,'v1.0.0'),
('ASO','single','ASO Titer','مضاد الستربتوليزين','Serum','IU/mL','<200','{"print":{"layout":"single-line"}}',8000,'v1.0.0'),
('AMYL','single','Amylase','أميليز','Serum','U/L','25-125','{"print":{"layout":"single-line"}}',8000,'v1.0.0'),
('LIP','single','Lipase','ليباز','Serum','U/L','10-140','{"print":{"layout":"single-line"}}',9000,'v1.0.0'),
('LDH','single','LDH','لاكتات ديهايدروجينيز','Serum','U/L','140-280','{"print":{"layout":"single-line"}}',9000,'v1.0.0'),
('CKMB','single','CK-MB','إنزيم القلب','Serum','U/L','<25','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('TROP','single','Troponin I/T','تروبونين','Serum','ng/mL','<0.04','{"print":{"layout":"single-line"}}',15000,'v1.0.0'),
('BGRH','single','Blood Group & Rh','فصيلة الدم + العامل الريزيسي','Whole Blood','','—','{"print":{"layout":"single-line"}}',5000,'v1.0.0');
-- Liver enzymes (singles)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('ALT','single','ALT (SGPT)','ALT (SGPT)','Serum','U/L','<=40','{"print":{"layout":"single-line"}}',6000,'v1.0.0'),
('AST','single','AST (SGOT)','AST (SGOT)','Serum','U/L','<=40','{"print":{"layout":"single-line"}}',6000,'v1.0.0'),
('ALP_S','single','Alkaline Phosphatase','الفوسفاتاز القلوي','Serum','U/L','44-147','{"print":{"layout":"single-line"}}',7000,'v1.0.0'),
('GGT','single','GGT','جاما جلوتاميل ترانسفيراز','Serum','U/L','M: 9-48 / F: 8-40','{"print":{"layout":"single-line"}}',8000,'v1.0.0');

-- Electrolytes (singles)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('NA','single','Sodium','صوديوم','Serum','mmol/L','135-145','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('K','single','Potassium','بوتاسيوم','Serum','mmol/L','3.5-5.0','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('CL','single','Chloride','كلورايد','Serum','mmol/L','98-106','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('MG','single','Magnesium','مغنيسيوم','Serum','mg/dL','1.7-2.2','{"print":{"layout":"single-line"}}',7000,'v1.0.0'),
('CA_S','single','Calcium','كالسيوم','Serum','mg/dL','8.5-10.5','{"print":{"layout":"single-line"}}',6000,'v1.0.0'),
('PHOS_S','single','Phosphorus','فوسفور','Serum','mg/dL','2.5-4.5','{"print":{"layout":"single-line"}}',6000,'v1.0.0');

-- Thyroid (additional singles)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('T3','single','Total T3','تي3 الكلي','Serum','ng/dL','80-200','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('T4','single','Total T4','تي4 الكلي','Serum','µg/dL','5-12','{"print":{"layout":"single-line"}}',12000,'v1.0.0');

-- Sex hormones / others
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('PROG','single','Progesterone','بروجستيرون','Serum','ng/mL','By phase','{"print":{"layout":"single-line"}}',15000,'v1.0.0'),
('CORT','single','Cortisol (AM)','كورتيزول صباحي','Serum','µg/dL','AM 5-25','{"print":{"layout":"single-line"}}',15000,'v1.0.0');

-- Coagulation (additional)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('DDIMER','single','D-Dimer (FEU)','دي دايمر','Plasma','ng/mL FEU','<500','{"print":{"layout":"single-line"}}',20000,'v1.0.0'),
('FIB','single','Fibrinogen','فيبرينوجين','Plasma','mg/dL','200-400','{"print":{"layout":"single-line"}}',15000,'v1.0.0');

-- Cardiac / inflammation extras
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('CK','single','CK (CPK) Total','كرياتين كاينيز الكلي','Serum','U/L','30-200','{"print":{"layout":"single-line"}}',9000,'v1.0.0'),
('PCT','single','Procalcitonin','بروكالسيتونين','Serum','ng/mL','<0.5','{"print":{"layout":"single-line"}}',30000,'v1.0.0'),
('LACT','single','Lactate','لاكتيت','Plasma','mmol/L','0.5-2.2','{"print":{"layout":"single-line"}}',12000,'v1.0.0');

-- Hematology extras
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('RETIC','single','Reticulocyte Count %','الريتكس','Whole Blood','%','0.5-2.5','{"print":{"layout":"single-line"}}',8000,'v1.0.0'),
('G6PD','single','G6PD Screen','فحص G6PD','Whole Blood','','Normal/Deficient','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('PBS','single','Peripheral Blood Smear','لطاخة دموية محيطية','Whole Blood','','—','{"print":{"layout":"single-line"}}',8000,'v1.0.0'),
('MP','single','Malaria Smear','ملاريا (لطاخة)','Blood','','Negative/Positive','{"print":{"layout":"single-line"}}',10000,'v1.0.0');

-- Pregnancy / H. pylori
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('UPT','single','Urine Pregnancy Test','فحص حمل سريع','Urine','','Negative/Positive','{"print":{"layout":"single-line"}}',5000,'v1.0.0'),
('HPSA','single','H. pylori Stool Antigen','مستضد الجرثومة الحلزونية (براز)','Stool','','Negative/Positive','{"print":{"layout":"single-line"}}',20000,'v1.0.0'),
('HPIGG','single','H. pylori IgG','أضداد الجرثومة الحلزونية IgG','Serum','','Negative/Positive','{"print":{"layout":"single-line"}}',15000,'v1.0.0');

-- Syphilis
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('VDRL','single','VDRL','الزهري (VDRL)','Serum','','Non-reactive','{"print":{"layout":"single-line"}}',10000,'v1.0.0'),
('TPHA','single','TPHA','الزهري (TPHA)','Serum','','Negative','{"print":{"layout":"single-line"}}',15000,'v1.0.0');

-- Viral singles (شائع طلبها منفردة)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('HBsAg','single','HBsAg','HBsAg','Serum','','Negative','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('AntiHCV','single','Anti-HCV Ab','أضداد التهاب الكبد C','Serum','','Negative','{"print":{"layout":"single-line"}}',15000,'v1.0.0'),
('HIVAb','single','HIV 1/2 Ab','أضداد HIV','Serum','','Negative','{"print":{"layout":"single-line"}}',20000,'v1.0.0'),
('HBsAb','single','Anti-HBs','أضداد HBs','Serum','','Positive','{"print":{"layout":"single-line"}}',12000,'v1.0.0');

-- Coombs (Blood bank)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,unit,ref_text,meta_json,price_iqd,version) VALUES
('DCT','single','Direct Coombs Test (DAT)','كومبس المباشر','Whole Blood','','Negative','{"print":{"layout":"single-line"}}',12000,'v1.0.0'),
('ICT','single','Indirect Coombs Test (IAT)','كومبس غير المباشر','Serum','','Negative','{"print":{"layout":"single-line"}}',12000,'v1.0.0');



/* ======================
   B) Panels (مجاميع بجدول)
   ====================== */

-- CBC (Hb/RBC/HCT مفصلة حسب الجنس)
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,meta_json,price_iqd,version)
VALUES
('CBC','panel','Complete Blood Count','تعداد الدم الكامل','Whole Blood(EDTA)',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"WBC","name_en":"WBC","unit":"/µL","ref":"4000-11000","order":1},

    {"code":"RBC","name_en":"RBC","unit":"x10^6/µL",
     "ref":"[{\"sex\":\"M\",\"low\":4.5,\"high\":6.0,\"unit\":\"x10^6/µL\"},{\"sex\":\"F\",\"low\":4.0,\"high\":5.5,\"unit\":\"x10^6/µL\"}]",
     "order":2},

    {"code":"HB","name_en":"Hb","unit":"g/dL",
     "ref":"[{\"sex\":\"M\",\"low\":13,\"high\":17,\"unit\":\"g/dL\"},{\"sex\":\"F\",\"low\":12,\"high\":15,\"unit\":\"g/dL\"}]",
     "order":3},

    {"code":"HCT","name_en":"HCT","unit":"%",
     "ref":"[{\"sex\":\"M\",\"low\":40,\"high\":50,\"unit\":\"%\"},{\"sex\":\"F\",\"low\":36,\"high\":46,\"unit\":\"%\"}]",
     "order":4},

    {"code":"MCV","name_en":"MCV","unit":"fL","ref":"80-96","order":5},
    {"code":"MCH","name_en":"MCH","unit":"pg","ref":"27-33","order":6},
    {"code":"MCHC","name_en":"MCHC","unit":"g/dL","ref":"32-36","order":7},
    {"code":"PLT","name_en":"Platelets","unit":"/µL","ref":"150000-450000","order":8},
    {"code":"NEUT","name_en":"Neutrophils %","unit":"%","ref":"40-75","order":9},
    {"code":"LYMPH","name_en":"Lymphocytes %","unit":"%","ref":"20-45","order":10},
    {"code":"MONO","name_en":"Monocytes %","unit":"%","ref":"2-10","order":11},
    {"code":"EOS","name_en":"Eosinophils %","unit":"%","ref":"1-6","order":12},
    {"code":"BASO","name_en":"Basophils %","unit":"%","ref":"0-1","order":13}
  ]
}',12000,'v1.0.1');

-- LFT
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('LFT','panel','Liver Function Test','وظائف الكبد',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"ALT","name_en":"SGPT (ALT)","unit":"U/L","ref":"<=40","order":1},
    {"code":"AST","name_en":"SGOT (AST)","unit":"U/L","ref":"<=40","order":2},
    {"code":"ALP","name_en":"ALP","unit":"U/L","ref":"44-147","order":3},
    {"code":"TBIL","name_en":"Total Bilirubin","unit":"mg/dL","ref":"0.3-1.2","order":4},
    {"code":"DBIL","name_en":"Direct Bilirubin","unit":"mg/dL","ref":"0-0.3","order":5},
    {"code":"TP","name_en":"Total Protein","unit":"g/dL","ref":"6.0-8.3","order":6},
    {"code":"ALB","name_en":"Albumin","unit":"g/dL","ref":"3.5-5.0","order":7},
    {"code":"GLOB","name_en":"Globulin","unit":"g/dL","ref":"2.0-3.5","order":8}
  ]
}',20000,'v1.0.0');

-- RFT
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('RFT','panel','Renal Function Test','وظائف الكلى',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"UREA","name_en":"Urea","unit":"mg/dL","ref":"15-45","order":1},

    {"code":"CREAT","name_en":"Creatinine","unit":"mg/dL",
     "ref":"[{\"sex\":\"M\",\"low\":0.7,\"high\":1.3,\"unit\":\"mg/dL\"},{\"sex\":\"F\",\"low\":0.6,\"high\":1.1,\"unit\":\"mg/dL\"}]",
     "order":2},

    {"code":"URIC","name_en":"Uric Acid","unit":"mg/dL","ref":"3.5-7.2 M / 2.6-6.0 F","order":3},
    {"code":"NA","name_en":"Sodium","unit":"mmol/L","ref":"135-145","order":4},
    {"code":"K","name_en":"Potassium","unit":"mmol/L","ref":"3.5-5.0","order":5},
    {"code":"CL","name_en":"Chloride","unit":"mmol/L","ref":"98-106","order":6},
    {"code":"CA","name_en":"Calcium","unit":"mg/dL","ref":"8.5-10.5","order":7},
    {"code":"PHOS","name_en":"Phosphorus","unit":"mg/dL","ref":"2.5-4.5","order":8}
  ]
}',18000,'v1.0.1');

-- Lipid Profile
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('LIPID','panel','Lipid Profile','دهون الدم',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"TC","name_en":"Total Cholesterol","unit":"mg/dL","ref":"<200","order":1},
    {"code":"TG","name_en":"Triglycerides","unit":"mg/dL","ref":"<150","order":2},
    {"code":"HDL","name_en":"HDL","unit":"mg/dL","ref":">40 M / >50 F","order":3},
    {"code":"LDL","name_en":"LDL","unit":"mg/dL","ref":"<130","order":4},
    {"code":"VLDL","name_en":"VLDL","unit":"mg/dL","ref":"5-40","order":5}
  ]
}',18000,'v1.0.0');

-- TFT
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('TFT','panel','Thyroid Function Test','وظائف الغدة الدرقية',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"TSH","name_en":"TSH","unit":"µIU/mL","ref":"0.4-4.0","order":1},
    {"code":"FT3","name_en":"Free T3","unit":"pg/mL","ref":"2.0-4.4","order":2},
    {"code":"FT4","name_en":"Free T4","unit":"ng/dL","ref":"0.9-2.3","order":3}
  ]
}',20000,'v1.0.0');

INSERT INTO tests_catalog 
(id, code, type, name_en, name_ar, meta_json, price_iqd, version)
VALUES (
  (SELECT id FROM tests_catalog WHERE code='TORCH'),
  'TORCH','panel','TORCH Panel','لوحة TORCH',
  '{
    "print":{"layout":"table"},
    "items":[
      {"code":"TOXO_IGM","name_en":"Toxoplasma IgM","ref":"Negative","order":1,"type":"choice","choices":["Negative","Positive"]},
      {"code":"TOXO_IGG","name_en":"Toxoplasma IgG","ref":"Negative","order":2,"type":"choice","choices":["Negative","Positive"]},
      {"code":"RUB_IGM","name_en":"Rubella IgM","ref":"Negative","order":3,"type":"choice","choices":["Negative","Positive"]},
      {"code":"RUB_IGG","name_en":"Rubella IgG","ref":"Negative","order":4,"type":"choice","choices":["Negative","Positive"]},
      {"code":"CMV_IGM","name_en":"CMV IgM","ref":"Negative","order":5,"type":"choice","choices":["Negative","Positive"]},
      {"code":"CMV_IGG","name_en":"CMV IgG","ref":"Negative","order":6,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HSV1_IGM","name_en":"HSV-1 IgM","ref":"Negative","order":7,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HSV1_IGG","name_en":"HSV-1 IgG","ref":"Negative","order":8,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HSV2_IGM","name_en":"HSV-2 IgM","ref":"Negative","order":9,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HSV2_IGG","name_en":"HSV-2 IgG","ref":"Negative","order":10,"type":"choice","choices":["Negative","Positive"]}
    ]
  }',
  60000,'v1.0.0'
);

-- Coagulation
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('COAG','panel','Coagulation Profile','التجلط',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"PT","name_en":"PT","unit":"sec","ref":"11-13.5","order":1},
    {"code":"INR","name_en":"INR","unit":"","ref":"0.8-1.2","order":2},
    {"code":"PTT","name_en":"PTT (APTT)","unit":"sec","ref":"25-35","order":3}
  ]
}',15000,'v1.0.0');

-- Hormonal Panel (basic)
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('HORM','panel','Hormonal Panel','الهرمونات',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"FSH","name_en":"FSH","unit":"mIU/mL","ref":"3.5-12.5 F / 1.5-12.4 M","order":1},
    {"code":"LH","name_en":"LH","unit":"mIU/mL","ref":"2.4-12.6 F / 1.7-8.6 M","order":2},
    {"code":"PRL","name_en":"Prolactin","unit":"ng/mL","ref":"2-29 F / 2-18 M","order":3},
    {"code":"TESTO","name_en":"Testosterone","unit":"ng/dL","ref":"300-1000 M / 20-80 F","order":4},
    {"code":"E2","name_en":"Estradiol","unit":"pg/mL","ref":"30-400 F / 20-75 M","order":5},
    {"code":"BHCG","name_en":"β-hCG","unit":"mIU/mL","ref":"Negative / by trimester","order":6}
  ]
}',70000,'v1.0.0');

-- Iron Studies
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('IRON','panel','Iron Studies','دراسة الحديد',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"SIR","name_en":"Serum Iron","unit":"µg/dL","ref":"60-170","order":1},
    {"code":"FER","name_en":"Ferritin","unit":"ng/mL","ref":"24-336 M / 11-307 F","order":2},
    {"code":"TIBC","name_en":"TIBC","unit":"µg/dL","ref":"240-450","order":3}
  ]
}',25000,'v1.0.0');

-- Vitamin Profile
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('VIT','panel','Vitamin Profile','الفيتامينات',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"B12","name_en":"Vitamin B12","unit":"pg/mL","ref":"200-900","order":1},
    {"code":"D3","name_en":"Vitamin D3","unit":"ng/mL","ref":"30-100","order":2},
    {"code":"FOL","name_en":"Folate","unit":"ng/mL","ref":"2.7-17","order":3}
  ]
}',30000,'v1.0.0');

-- Tumor Markers
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('TUMOR','panel','Tumor Markers','دلالات الأورام',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"AFP","name_en":"AFP","unit":"ng/mL","ref":"<10","order":1},
    {"code":"CEA","name_en":"CEA","unit":"ng/mL","ref":"<5","order":2},
    {"code":"CA125","name_en":"CA-125","unit":"U/mL","ref":"<35","order":3},
    {"code":"CA153","name_en":"CA 15-3","unit":"U/mL","ref":"<30","order":4},
    {"code":"CA199","name_en":"CA 19-9","unit":"U/mL","ref":"<37","order":5},
    {"code":"PSA","name_en":"PSA","unit":"ng/mL","ref":"<4","order":6}
  ]
}',90000,'v1.0.0');

-- Autoimmune Panel
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version)
VALUES
('AUTOIMM','panel','Autoimmune Panel','مناعة ذاتية',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"ANA","name_en":"ANA","ref":"Negative","order":1},
    {"code":"ADNA","name_en":"Anti-dsDNA","unit":"IU/mL","ref":"<30","order":2},
    {"code":"RF","name_en":"Rheumatoid Factor","unit":"IU/mL","ref":"<20","order":3}
  ]
}',35000,'v1.0.0');

-- Viral Markers
INSERT INTO tests_catalog 
(id, code, type, name_en, name_ar, meta_json, price_iqd, version)
VALUES (
  (SELECT id FROM tests_catalog WHERE code='VIRAL'),
  'VIRAL','panel','Viral Markers','الفيروسات',
  '{
    "print":{"layout":"table"},
    "items":[
      {"code":"HBsAg","name_en":"HBsAg","ref":"Negative","order":1,"type":"choice","choices":["Negative","Positive"]},
      {"code":"AntiHCV","name_en":"Anti-HCV","ref":"Negative","order":2,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HIVAb","name_en":"HIV Ab","ref":"Negative","order":3,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HBeAg","name_en":"HBeAg","ref":"Negative","order":4,"type":"choice","choices":["Negative","Positive"]},
      {"code":"HBsAb","name_en":"HBsAb","ref":"Positive","order":5,"type":"choice","choices":["Negative","Positive"]}
    ]
  }',
  60000,'v1.0.0'
);


-- OGTT (Oral Glucose Tolerance Test)
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version) VALUES
('OGTT','panel','Oral Glucose Tolerance Test','تحمّل السكر الفموي',
'{
  "print":{"layout":"table","note":"Fasting <100 mg/dL, 2h <140 mg/dL"},
  "items":[
    {"code":"GLU_0","name_en":"Fasting (0 min)","unit":"mg/dL","ref":"<100","order":1},
    {"code":"GLU_30","name_en":"30 min","unit":"mg/dL","ref":"—","order":2},
    {"code":"GLU_60","name_en":"60 min","unit":"mg/dL","ref":"—","order":3},
    {"code":"GLU_90","name_en":"90 min","unit":"mg/dL","ref":"—","order":4},
    {"code":"GLU_120","name_en":"120 min","unit":"mg/dL","ref":"<140","order":5}
  ]
}',25000,'v1.0.0');

-- Electrolytes panel (بديل سريع عند طلب مجموعة)
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version) VALUES
('ELEC','panel','Electrolytes Panel','إلكتروليات',
'{
  "print":{"layout":"table"},
  "items":[
    {"code":"NA","name_en":"Sodium","unit":"mmol/L","ref":"135-145","order":1},
    {"code":"K","name_en":"Potassium","unit":"mmol/L","ref":"3.5-5.0","order":2},
    {"code":"CL","name_en":"Chloride","unit":"mmol/L","ref":"98-106","order":3},
    {"code":"HCO3","name_en":"Bicarbonate (HCO3-)","unit":"mmol/L","ref":"22-28","order":4}
  ]
}',15000,'v1.0.0');

-- WIDAL Panel (Typhoid)
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version) VALUES
('WIDAL','panel','Widal Test (Typhoid)','اختبار التيفوئيد (WIDAL)',
'{
  "print":{"layout":"table","note":"Negative <1:80 (حسب المختبر)"},
  "items":[
    {"code":"TO","name_en":"S. typhi O","unit":"titer","ref":"<1:80","order":1},
    {"code":"TH","name_en":"S. typhi H","unit":"titer","ref":"<1:80","order":2},
    {"code":"AH","name_en":"S. paratyphi A (H)","unit":"titer","ref":"<1:80","order":3},
    {"code":"BH","name_en":"S. paratyphi B (H)","unit":"titer","ref":"<1:80","order":4}
  ]
}',15000,'v1.0.0');

-- Urine ACR (Albumin/Creatinine Ratio)
INSERT INTO tests_catalog (code,type,name_en,name_ar,meta_json,price_iqd,version) VALUES
('UACR','panel','Urine ACR','نسبة ألبومين/كرياتينين في البول',
'{
  "print":{"layout":"table","note":"ACR <30 mg/g"},
  "items":[
    {"code":"UALB","name_en":"Urine Albumin","unit":"mg/L","ref":"—","order":1},
    {"code":"UCR","name_en":"Urine Creatinine","unit":"mg/dL","ref":"—","order":2},
    {"code":"ACR","name_en":"Albumin/Creatinine Ratio","unit":"mg/g","ref":"<30","order":3}
  ]
}',15000,'v1.0.0');


/* ======================
   C) Composite (متعددة الأقسام)
   ====================== */

-- Stool Examination
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,meta_json,price_iqd,version)
VALUES
('STOOL','composite','Stool Examination','تحليل البراز','Stool',
'{
  "print":{"layout":"sections"},
  "sections":[
    {"code":"MACRO","name_en":"Macroscopic","name_ar":"فحص عياني","order":1,
     "fields":[
       {"code":"COLOR","label_en":"Color","label_ar":"اللون","type":"text","order":1},
       {"code":"CONS","label_en":"Consistency","label_ar":"القوام","type":"choice","choices":["Soft","Hard","Watery","Mucoid"],"order":2},
       {"code":"MUCUS","label_en":"Mucus","label_ar":"مخاط","type":"presence","choices":["Present","Absent"],"order":3},
       {"code":"BLOOD","label_en":"Blood","label_ar":"دم","type":"presence","choices":["Present","Absent"],"order":4}
     ]},
    {"code":"MICRO","name_en":"Microscopic","name_ar":"فحص مجهري","order":2,
     "fields":[
       {"code":"RBC","label_en":"RBCs","label_ar":"كريات حمراء","type":"text","order":1},
       {"code":"WBC","label_en":"WBCs","label_ar":"كريات بيضاء","type":"text","order":2},
       {"code":"OVA","label_en":"Ova","label_ar":"بيض الطفيليات","type":"text","order":3},
       {"code":"CYST","label_en":"Cysts","label_ar":"أكياس","type":"text","order":4},
       {"code":"PARA","label_en":"Parasites","label_ar":"طفيليات","type":"text","order":5}
     ]},
    {"code":"CHEM","name_en":"Chemical","name_ar":"كيميائي","order":3,
     "fields":[
       {"code":"OCCB","label_en":"Occult Blood","label_ar":"دم خفي","type":"choice","choices":["Negative","Positive"],"order":1}
     ]}
  ]
}',15000,'v1.0.0');

-- Urine Examination
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,meta_json,price_iqd,version)
VALUES
('URINE','composite','Urine Examination','تحليل البول','Urine',
'{
  "print":{"layout":"sections"},
  "sections":[
    {"code":"PHYS","name_en":"Physical","name_ar":"فيزيائي","order":1,
     "fields":[
       {"code":"COLOR","label_en":"Color","label_ar":"اللون","type":"text","order":1},
       {"code":"APP","label_en":"Appearance","label_ar":"المظهر","type":"text","order":2},
       {"code":"SG","label_en":"Specific Gravity","label_ar":"الكثافة النوعية","type":"text","order":3},
       {"code":"PH","label_en":"pH","label_ar":"pH","type":"text","order":4}
     ]},
    {"code":"CHEM","name_en":"Chemical","name_ar":"كيميائي","order":2,
     "fields":[
       {"code":"PROT","label_en":"Protein","label_ar":"بروتين","type":"choice","choices":["Negative","Trace","+","++","+++"],"order":1},
       {"code":"GLU","label_en":"Glucose","label_ar":"سكر","type":"choice","choices":["Negative","+","++","+++"],"order":2},
       {"code":"KET","label_en":"Ketone","label_ar":"كيتون","type":"choice","choices":["Negative","+","++","+++"],"order":3},
       {"code":"BIL","label_en":"Bilirubin","label_ar":"بيليروبين","type":"choice","choices":["Negative","+","++"],"order":4},
       {"code":"URO","label_en":"Urobilinogen","label_ar":"Urobilinogen","type":"choice","choices":["Normal","Increased"],"order":5}
     ]},
    {"code":"MICRO","name_en":"Microscopic","name_ar":"مجهري","order":3,
     "fields":[
       {"code":"RBC","label_en":"RBCs (/HPF)","label_ar":"كريات حمراء","type":"text","order":1},
       {"code":"WBC","label_en":"WBCs (/HPF)","label_ar":"كريات بيضاء","type":"text","order":2},
       {"code":"EPI","label_en":"Epithelial Cells","label_ar":"خلايا طلائية","type":"text","order":3},
       {"code":"CAST","label_en":"Casts","label_ar":"اسطوانات","type":"text","order":4},
       {"code":"CRYS","label_en":"Crystals","label_ar":"بلورات","type":"text","order":5}
     ]}
  ]
}',15000,'v1.0.0');

-- Culture Report
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,meta_json,price_iqd,version)
VALUES
('CULT','composite','Culture Report','زرع البكتيريا','Varies',
'{
  "print":{"layout":"sections"},
  "sections":[
    {"code":"MACRO","name_en":"Macroscopic","name_ar":"فحص عياني","order":1,
     "fields":[
       {"code":"APP","label_en":"Appearance","label_ar":"المظهر","type":"text","order":1},
       {"code":"GROW","label_en":"Growth","label_ar":"النمو","type":"text","order":2}
     ]},
    {"code":"MICRO","name_en":"Microscopic","name_ar":"فحص مجهري","order":2,
     "fields":[
       {"code":"GRAM","label_en":"Gram Stain","label_ar":"غرام","type":"choice","choices":["Gram Positive","Gram Negative"],"order":1},
       {"code":"MORPH","label_en":"Morphology","label_ar":"الشكل","type":"choice","choices":["Cocci","Bacilli"],"order":2}
     ]},
    {"code":"BIOC","name_en":"Biochemical Tests","name_ar":"اختبارات كيميائية حيوية","order":3,
     "fields":[
       {"code":"CATA","label_en":"Catalase","label_ar":"كاتاليز","type":"choice","choices":["Positive","Negative"],"order":1},
       {"code":"OXI","label_en":"Oxidase","label_ar":"أوكسيداز","type":"choice","choices":["Positive","Negative"],"order":2},
       {"code":"OTHER","label_en":"Other Tests","label_ar":"اختبارات أخرى","type":"text","order":3}
     ]},
    {"code":"FINAL","name_en":"Final Report","name_ar":"النتيجة النهائية","order":4,
     "fields":[
       {"code":"ORG","label_en":"Organism Isolated","label_ar":"العامل الممرض","type":"text","order":1},
       {"code":"ABX","label_en":"Sensitivity (Antibiogram)","label_ar":"اختبار الحساسية","type":"text","order":2}
     ]}
  ]
}',30000,'v1.0.0');

-- Semen Analysis
INSERT INTO tests_catalog (code,type,name_en,name_ar,sample_type,meta_json,price_iqd,version) VALUES
('SEMEN','composite','Semen Analysis','تحليل السائل المنوي','Semen',
'{
  "print":{"layout":"sections","note":"WHO 2010+ refs: Volume ≥1.5 mL, pH ≥7.2, Count ≥15 M/mL, Progressive ≥32%"},
  "sections":[
    {"code":"PHY","name_en":"Physical","name_ar":"خواص فيزيائية","order":1,
     "fields":[
       {"code":"VOL","label_en":"Volume (mL)","label_ar":"الحجم (مل)","type":"text","order":1},
       {"code":"COLOR","label_en":"Color","label_ar":"اللون","type":"text","order":2},
       {"code":"VISC","label_en":"Viscosity","label_ar":"اللزوجة","type":"text","order":3},
       {"code":"PH","label_en":"pH","label_ar":"pH","type":"text","order":4}
     ]},
    {"code":"MICRO","name_en":"Microscopic","name_ar":"فحص مجهري","order":2,
     "fields":[
       {"code":"COUNT","label_en":"Sperm Count (M/mL)","label_ar":"العدد (مليون/مل)","type":"text","order":1},
       {"code":"PMOT","label_en":"Progressive Motility (%)","label_ar":"حركة تقدّمية (%)","type":"text","order":2},
       {"code":"TMOT","label_en":"Total Motility (%)","label_ar":"الحركة الكلية (%)","type":"text","order":3},
       {"code":"MORPH","label_en":"Normal Morphology (%)","label_ar":"الأشكال الطبيعية (%)","type":"text","order":4},
       {"code":"WBC","label_en":"WBC (cells/mL)","label_ar":"كريات بيضاء/مل","type":"text","order":5},
       {"code":"AGGL","label_en":"Agglutination","label_ar":"تكتّل","type":"presence","choices":["Present","Absent"],"order":6}
     ]}
  ]
}',25000,'v1.0.0');

COMMIT;
