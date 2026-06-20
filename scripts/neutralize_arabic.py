#!/usr/bin/env python3
"""Replace feminine Arabic address forms with gender-neutral masculine default."""
import re
from pathlib import Path

ROOT = Path('/home/abdalah/code/gateo')
TARGETS = list(ROOT.rglob('*.ts')) + list(ROOT.rglob('*.tsx')) + list(ROOT.rglob('*.prisma'))
# Skip generated/dependency folders
TARGETS = [p for p in TARGETS if 'node_modules' not in p.parts and '.next' not in p.parts]

# Order matters: longer phrases first
REPLACEMENTS = [
    # pronouns / possessives
    ('كِ', 'ك'),
    ('بكِ', 'بك'),
    ('منكِ', 'منك'),
    ('لكِ', 'لك'),
    ('كِم', 'كم'),
    ('حسابكِ', 'حسابك'),
    ('موقعكِ', 'موقعك'),
    ('اهتماماتكِ', 'اهتماماتك'),
    ('مجتمعكِ', 'مجتمعك'),
    ('من حولكِ', 'من حولك'),
    ('نشاطكِ', 'نشاطك'),
    ('لديكِ', 'لديك'),
    ('أنتِ', 'أنت'),
    ('يمكنكِ', 'يمكنك'),
    # imperative feminine -> masculine
    ('سجّلي حسابكِ', 'سجّل حسابك'),
    ('أنشئي حسابكِ التجاري', 'أنشئ حسابك التجاري'),
    ('انضمي', 'انضم'),
    ('اكتشفي', 'اكتشف'),
    ('أدخلي', 'أدخل'),
    ('اخترِ', 'اختر'),
    ('سجّلي', 'سجّل'),
    ('تابعي', 'تابع'),
    ('احجزي', 'احجز'),
    ('اكتبي', 'اكتب'),
    ('أرسلي', 'أرسل'),
    ('أنشئي', 'أنشئ'),
    ('قومي', 'قم'),
    ('اضغطي', 'اضغط'),
    ('تأكدي', 'تأكد'),
    ('شاهدي', 'شاهد'),
    ('شاركي', 'شارك'),
    ('صوّري', 'صوّر'),
    ('ابدئي', 'ابدأ'),
    ('حمّلي', 'حمّل'),
    ('أضيفي', 'أضف'),
    ('عدّلي', 'عدّل'),
    ('احذفي', 'احذف'),
    ('أخبري', 'أخبر'),
    ('ابحثي', 'ابحث'),
    ('اجعلي', 'اجعل'),
    ('أكملي', 'أكمل'),
    ('قدّمي', 'قدّم'),
    ('راجعي', 'راجع'),
    ('تواصلي', 'تواصل'),
    ('اجمعي', 'اجمع'),
    ('تسوقي', 'تسوّق'),
    # verbs
    ('تريدين', 'تريد'),
    ('تعرفينهم', 'تعرفهم'),
    ('تستطيعين', 'تستطيع'),
    # gendered nouns/adjectives
    ('مستخدمة', 'مستخدم'),
    ('مشرفة', 'مشرف'),
    ('موثقة', 'موثق'),
    ('نشطة', 'نشط'),
    ('فعّالة', 'فعّال'),
    ('نسائية', 'عامة'),
    ('نسائي', 'عام'),
    ('مناسبة للسيدات', 'مناسبة للجميع'),
    ('للسيدات فوق 18 سنة', 'لمن هم فوق 18 سنة'),
    ('للسيدات', 'للجميع'),
    ('هل أنت متأكدة', 'هل أنت متأكد'),
    ('فنانات المكياج', 'فنانو مكياج'),
    ('مصففات الشعر', 'مصففو الشعر'),
    # misc
    ('أكملي بياناتكِ', 'أكمل بياناتك'),
    ('أدخلي رقم هاتف صحيح', 'أدخل رقم هاتف صحيح'),
    ('أدخلي الاسم الكامل', 'أدخل الاسم الكامل'),
    ('أدخلي البريد أو رقم الهاتف', 'أدخل البريد أو رقم الهاتف'),
    ('اكتبي نبذة قصيرة عنكِ', 'اكتب نبذة قصيرة عنك'),
    ('اكتشفي عالم', 'اكتشف عالم'),
]

def replace_all(text):
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text

changed = 0
for path in TARGETS:
    try:
        original = path.read_text(encoding='utf-8')
    except Exception:
        continue
    updated = replace_all(original)
    if updated != original:
        path.write_text(updated, encoding='utf-8')
        changed += 1
        print(f'Updated: {path.relative_to(ROOT)}')

print(f'\nTotal files changed: {changed}')
