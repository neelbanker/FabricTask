#include<iostream.h>
#include<conio.h>

int main()
{
   int i,j,k; 
   int n;
   cout<<"Enter the number";
   cin>>n;
   
   for(i =1;i<=n;i++)
   {
       for (j=1;j<=i;j++)
       {
           if(j%2==0)
            {  
                cout<<"*";
            }
            else
            {
                cout<<j;
            }
        
       }
       cout<<"\n";
   }
   return 0;
}