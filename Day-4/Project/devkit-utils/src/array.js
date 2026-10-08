export const unique  = (arr) =>[...newSet(arr)];

export const chunk = (arr,size) =>{
    const out =[];
    for(let i=0;i< arr.length;i += size) out.push(arr.slice(i, i+size));
    return out;
};

export const groupBy = (arr, keyFn) =>
    arr.reduce((acc,item) =>{
        const key = keyFn(item)
        (acc[key] ||= []).push(item)
        return acc;
    },{});

export const compact =(arr) => arr.filter(Boolean)