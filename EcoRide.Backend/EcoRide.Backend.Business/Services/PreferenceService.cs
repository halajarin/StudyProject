using System.Text.Json;
using EcoRide.Backend.Business.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;

namespace EcoRide.Backend.Business.Services;

public class PreferenceService : IPreferenceService
{
    private readonly IMongoCollection<BsonDocument> _preferencesCollection;

    public PreferenceService(IMongoDatabase mongoDatabase, IConfiguration configuration)
    {
        var collectionName = configuration["MongoDbSettings:PreferencesCollectionName"];
        _preferencesCollection = mongoDatabase.GetCollection<BsonDocument>(collectionName!);
    }

    public async Task<Dictionary<string, object?>?> GetPreferencesAsync(int userId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        var doc = await _preferencesCollection.Find(filter).FirstOrDefaultAsync();
        if (doc == null) return null;

        doc.Remove("_id");
        var dict = new Dictionary<string, object?>();
        foreach (var element in doc)
        {
            dict[element.Name] = BsonTypeMapper.MapToDotNetValue(element.Value);
        }
        return dict;
    }

    public async Task CreateOrUpdatePreferencesAsync(int userId, Dictionary<string, object> preferences)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        var existing = await _preferencesCollection.Find(filter).FirstOrDefaultAsync();

        var document = new BsonDocument
        {
            { "utilisateur_id", userId },
            { "fumeur", GetBool(preferences, "fumeur") },
            { "animaux", GetBool(preferences, "animaux") }
        };

        if (preferences.ContainsKey("preferences_personnalisees"))
        {
            var customPrefs = GetStringList(preferences, "preferences_personnalisees");
            document.Add("preferences_personnalisees", new BsonArray(customPrefs));
        }

        document.Add("date_modification", DateTime.UtcNow);

        if (existing != null)
        {
            await _preferencesCollection.ReplaceOneAsync(filter, document);
        }
        else
        {
            await _preferencesCollection.InsertOneAsync(document);
        }
    }

    private static bool GetBool(Dictionary<string, object> dict, string key)
    {
        if (!dict.TryGetValue(key, out var value)) return false;
        if (value is bool b) return b;
        if (value is JsonElement je && je.ValueKind == JsonValueKind.True) return true;
        return false;
    }

    private static List<string> GetStringList(Dictionary<string, object> dict, string key)
    {
        if (!dict.TryGetValue(key, out var value)) return new List<string>();
        if (value is List<string> list) return list;
        if (value is JsonElement je && je.ValueKind == JsonValueKind.Array)
        {
            return je.EnumerateArray().Select(e => e.GetString() ?? "").ToList();
        }
        return new List<string>();
    }

    public async Task DeletePreferencesAsync(int userId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        await _preferencesCollection.DeleteOneAsync(filter);
    }
}
