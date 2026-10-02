AEGIS fine-tuned classifier
classes: 0=legit, 1=scam, 2=injection
INPUT CONTRACT: pad/truncate to exactly 128 tokens; pass a 4D float32 attention mask of shape [1,1,1,128] with 0.0 at real tokens and -3.4028235e38 at pad positions.

validation report:
              precision    recall  f1-score   support

       legit      1.000     0.889     0.941         9
        scam      0.933     1.000     0.966        14
   injection      1.000     1.000     1.000        19

    accuracy                          0.976        42
   macro avg      0.978     0.963     0.969        42
weighted avg      0.978     0.976     0.976        42
