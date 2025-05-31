import json
import re
import sys

def extract_first_float(text):
    if isinstance(text, (int, float)):
        return float(text)
    if isinstance(text, str):
        text = re.sub(r"(?i)approx\.?\s*|~\s*|[<>]", "", text)
        match = re.match(r"(\d+\.?\d*)\s*-\s*\d+\.?\d*", text)
        if match:
            return float(match.group(1))
        matches = re.findall(r"(\d+\.?\d*)", text)
        if matches:
            return float(matches[0])
    return 0.0

def clean_rdi(rdi_str, original_value_str):
    if not isinstance(rdi_str, str):
        rdi_str = str(rdi_str)
    value_from_rdi = None
    if not isinstance(original_value_str, (int, float)): # If original value is not a number
        rdi_prefix_match = re.match(r"^[^\(]*?(\d+\.?\d+)[^\%]*?\(", rdi_str)
        if rdi_prefix_match:
            value_from_rdi = float(rdi_prefix_match.group(1))

    percentage_match = re.search(r"\(?(\d+\.?\d*(?:-\d+\.?\d*)?%)\)?", rdi_str)
    if percentage_match:
        return percentage_match.group(1), value_from_rdi

    if rdi_str.endswith('%') and (rdi_str[:-1].replace('.', '', 1).isdigit() or \
                                  ( '-' in rdi_str[:-1] and all(part.replace('.', '', 1).isdigit() for part in rdi_str[:-1].split('-')) ) ):
        return rdi_str, value_from_rdi

    return "", value_from_rdi

def clean_nutrition_data():
    try:
        json_string = sys.stdin.read()
        data = json.loads(json_string)
    except Exception: # Catch any error during load and return original
        # This ensures if input is totally bad, we don't crash, just return it unmodified.
        # For the purposes of this tool, it's better than erroring out the whole turn.
        return json_string, False

    if 'nutrition' not in data or not isinstance(data['nutrition'], dict):
        return json.dumps(data, indent=2), False

    nutrition = data['nutrition']
    overall_modified_flag = False

    # Ensure 'calories' is a string
    if 'calories' in nutrition:
        if not isinstance(nutrition['calories'], str):
            nutrition['calories'] = str(nutrition['calories'])
            overall_modified_flag = True
    else:
        nutrition['calories'] = "0"
        overall_modified_flag = True

    for category in ['macronutrients', 'vitamins', 'minerals']:
        if category in nutrition and isinstance(nutrition[category], list):
            new_category_list = []
            category_had_internal_changes = False # To check if the list itself needs update
            for item in nutrition[category]:
                if not isinstance(item, dict):
                    new_category_list.append(item)
                    continue

                item_copy = item.copy()
                original_item_for_diff = item.copy() # For accurate diffing

                original_value_str_for_rdi_context = str(item_copy.get('value', '0'))
                current_value_for_cleaning = item_copy.get('value', 0)

                cleaned_value = extract_first_float(current_value_for_cleaning)

                if item_copy.get('value') != cleaned_value or not isinstance(item_copy.get('value'), float):
                    item_copy['value'] = cleaned_value

                if isinstance(item_copy['value'], int):
                    item_copy['value'] = float(item_copy['value'])

                rdi_original_val = item_copy.get('rdi') # Could be None
                rdi_to_clean = item_copy.get('rdi', '') # Default to empty string for cleaning

                cleaned_rdi, value_from_rdi = clean_rdi(rdi_to_clean, original_value_str_for_rdi_context)

                if value_from_rdi is not None and cleaned_value == 0.0:
                    item_copy['value'] = value_from_rdi
                    if isinstance(item_copy['value'], int):
                        item_copy['value'] = float(item_copy['value'])

                if rdi_original_val != cleaned_rdi: # Handles missing RDI (None != '') or changed RDI
                    item_copy['rdi'] = cleaned_rdi

                if category in ['vitamins', 'minerals']:
                    if 'name' not in item_copy or item_copy['name'] is None: item_copy['name'] = "Unknown"
                    if 'unit' not in item_copy or item_copy['unit'] is None: item_copy['unit'] = "unit"

                if category == 'macronutrients':
                    if 'unit' not in item_copy or item_copy['unit'] is None: item_copy['unit'] = "g"

                if item_copy != original_item_for_diff:
                    category_had_internal_changes = True
                    overall_modified_flag = True

                new_category_list.append(item_copy)

            if category_had_internal_changes:
                 nutrition[category] = new_category_list

    return json.dumps(data, indent=2), overall_modified_flag

if __name__ == '__main__':
    cleaned_json, modified = clean_nutrition_data()
    print(f"MODIFIED:{modified}")
    print(cleaned_json)
