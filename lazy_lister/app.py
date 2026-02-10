import streamlit as st
import google.generativeai as genai
from PIL import Image

# --- CONFIGURATION ---
# In a real app, use st.secrets for the API key, but for now input it in the sidebar
st.set_page_config(page_title="Lazy Lister 🇳🇬", page_icon="🛍️")

# --- UI LAYOUT ---
st.title("🛍️ Lazy Lister (SellSharp)")
st.write("Snap a pic, get a sales caption. Simple.")

# Sidebar for setup
with st.sidebar:
    api_key = st.text_input("Enter Google API Key", type="password")
    st.info("Get your key from aistudio.google.com")

# --- MAIN LOGIC ---
uploaded_file = st.file_uploader("Upload item photo", type=["jpg", "png", "jpeg"])

if uploaded_file is not None:
    # Display the image
    image = Image.open(uploaded_file)
    st.image(image, caption="Your Item", use_column_width=True)

    # --- USER INPUTS ---
    condition = st.radio("Condition", ["New", "UK Used", "Naija Used"], horizontal=True)
    platform = st.selectbox("Platform", ["Instagram", "WhatsApp Status", "Jiji"])

    # The 'Magic' Button
    if st.button("Generate Listing"):
        if not api_key:
            st.error("Please enter an API Key in the sidebar first!")
        else:
            with st.spinner("Analyzing your item... 🧐"):
                try:
                    # Configure Gemini
                    genai.configure(api_key=api_key)
                    model = genai.GenerativeModel('gemini-pro-vision')

                    # The "Secret Sauce" Prompt
                    prompt = f"""
                    You are an expert Nigerian social media marketer.
                    Look at this image. I want to sell this item.
                    
                    **Context:**
                    - Condition: {condition}
                    - Platform: {platform}

                    **Tasks:**
                    1. Identify the item precisely.
                    2. Estimate a price range in NGN (Naira) based on current Nigerian market value for this condition.
                    3. Write a sales caption tailored for {platform}:
                    """

                    if platform == "WhatsApp Status":
                        prompt += """
                        - Keep it short and punchy.
                        - Use plenty of emojis.
                        - Focus on urgency (e.g., "Fastest fingers!").
                        """
                    elif platform == "Jiji":
                        prompt += """
                        - Write a formal, clear description.
                        - List key specifications in bullet points.
                        - Maintain a professional tone. No unnecessary emojis.
                        """
                    else: # Instagram
                        prompt += """
                        - Write a catchy, engaging story or hook.
                        - Use a friendly and persuasive tone.
                        - Add 5-10 relevant hashtags.
                        """
                    
                    prompt += """
                    Format the output clearly.
                    """

                    # Generate content
                    response = model.generate_content([prompt, image])
                    st.success("Listing Ready!")
                    st.markdown(response.text)

                except Exception as e:
                    st.error(f"Omo, something broke: {e}")
