document.addEventListener('DOMContentLoaded', () => {
    const reviewBtn = document.getElementById('review-btn');
    const codeInput = document.getElementById('code-input');
    const reviewOutput = document.getElementById('review-output');
  
    reviewBtn.addEventListener('click', async () => {
      const code = codeInput.value.trim();
      reviewOutput.textContent = 'Reviewing...';
  
      if (!code) {
        reviewOutput.textContent = 'Please enter some code first.';
        return;
      }
  
      try {
        const response = await fetch('http://localhost:5000/api/review-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        reviewOutput.textContent = data.review || 'No review returned.';
      } catch (error) {
        console.error('Fetch error:', error);
        reviewOutput.textContent = 'Error: ' + error.message;
      }
    });
  });
  