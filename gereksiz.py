import pandas as pd
df = pd.read_csv(r"C:\Users\altin\OneDrive\Akademi\staj\veriler\creditcard.csv")
print(df.head(5))
df = df.loc[df.Class==1]
print(df)
print(df.info())